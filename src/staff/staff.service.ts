import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import express from "express";
import { Role } from "src/generated/prisma/enums";
import { PrismaService } from "src/prisma/prisma.service";
import { hashPassword } from "src/utils";
import  { StaffFrontEnd, StaffPayload } from "src/utils/types";
import  { CreateStaffDto } from "./dto/create-staff.dto";
import  { UpdateStaffDto } from "./dto/update-staff.dto";

@Injectable()
export class StaffService {
	constructor(private prisma: PrismaService) { }

	async create(createStaffDto: CreateStaffDto, staff?: StaffPayload) {
		const staffCount = await this.prisma.staff.count();

		if (staffCount > 0) {
			if (!staff) {
				throw new UnauthorizedException();
			}

			const requestAccount = await this.prisma.staff.findUniqueOrThrow({
				where: { id: staff.id },
			});

			if (requestAccount.role !== "ADMIN") {
				throw new UnauthorizedException();
			}
		}

		this.validateVenueAndDutyManagerAssignments(createStaffDto);

		const hashedPassword = await hashPassword(createStaffDto.password);

		const newStaff = await this.prisma.$transaction(async (tx) => {
			const staff = await tx.staff.create({
				data: {
					email: createStaffDto.email.trim().toLowerCase(),
					password: hashedPassword,
					name: createStaffDto.name.trim().toLowerCase(),
					role: createStaffDto.role,
				},
			});

			if (
				createStaffDto.role === Role.VENUE_MANAGER &&
				createStaffDto.venueManagerAssignments
			) {
				await tx.venueManager.createMany({
					data: createStaffDto.venueManagerAssignments.map((venueId) => ({
						userId: staff.id,
						venueId,
					})),
				});
			}

			if (
				createStaffDto.role === Role.DUTY_MANAGER &&
				createStaffDto.dutyManagerAssignments
			) {
				await tx.dutyManager.createMany({
					data: createStaffDto.dutyManagerAssignments.map((venueId) => ({
						userId: staff.id,
						venueId,
					})),
				});
			}

			return staff;
		});

		return `created account for ${newStaff.name} with a role of ${newStaff.role}`;
	}

	async findAll(): Promise<StaffFrontEnd[]> {
		return this.prisma.staff.findMany({
			omit: {
				password: true,
			},
			orderBy: {
				name: "asc",
			},
			include: {
				venueManagerAssignments: true,
				dutyManagerAssignments: true,
			},
		});
	}

	async isSetupDone() {
		const staffCount = await this.prisma.staff.count();
		const venueCount = await this.prisma.venue.count();

		return {
			isInitialAdminCreated: staffCount > 0 ? true : false,
			isInitialVenueCreated: venueCount > 0 ? true : false,
		};
	}

	async findOneById(id: string): Promise<StaffFrontEnd> {
		return await this.prisma.staff.findUniqueOrThrow({
			where: { id: id },
			omit: {
				password: true,
			},
			include: {
				venueManagerAssignments: true,
				dutyManagerAssignments: true,
			},
		});
	}

	async findOneByEmail(email: string) {
		return await this.prisma.staff.findUniqueOrThrow({
			where: {
				email: email,
			},
		});
	}

	async updateById(
		staff: StaffPayload,
		id: string,
		updateStaffDto: UpdateStaffDto,
	): Promise<StaffFrontEnd> {
		const staffCount = await this.prisma.staff.count();

		if (staffCount > 0) {
			if (!staff) {
				throw new UnauthorizedException();
			}

			const requestAccount = await this.prisma.staff.findUniqueOrThrow({
				where: { id: staff.id },
			});

			if (requestAccount.role !== "ADMIN") {
				throw new UnauthorizedException();
			}
		}
		this.validateVenueAndDutyManagerAssignments(updateStaffDto);

		let hashedPassword: string | undefined;

		if (updateStaffDto.password) {
			hashedPassword = await hashPassword(updateStaffDto.password);
		}

		const updatedStaff = await this.prisma.$transaction(async (tx) => {
			const existing = await tx.staff.findUnique({ where: { id } });
			if (!existing)
				throw new NotFoundException(`Staff member ${id} not found`);

			if (updateStaffDto.role && updateStaffDto.role !== existing.role) {
				await tx.venueManager.deleteMany({ where: { userId: id } });
				await tx.dutyManager.deleteMany({ where: { userId: id } });
			}

			const staff = await tx.staff.update({
				where: {
					id: id,
				},
				data: {
					email: updateStaffDto.email
						? updateStaffDto.email.trim().toLowerCase()
						: updateStaffDto.email,
					password: updateStaffDto.password
						? hashedPassword
						: updateStaffDto.password,
					name: updateStaffDto.name
						? updateStaffDto.name.trim().toLowerCase()
						: updateStaffDto.name,
					role: updateStaffDto.role,
				},
				omit: {
					password: true,
				},
				include: {
					venueManagerAssignments: true,
					dutyManagerAssignments: true,
				},
			});

			if (
				updateStaffDto.role === Role.VENUE_MANAGER &&
				updateStaffDto.venueManagerAssignments
			) {
				await tx.venueManager.deleteMany({
					where: {
						id: id,
					},
				});

				await tx.venueManager.createMany({
					data: updateStaffDto.venueManagerAssignments!.map((venueId) => ({
						userId: staff.id,
						venueId,
					})),
				});
			}

			if (
				updateStaffDto.role === Role.DUTY_MANAGER &&
				updateStaffDto.dutyManagerAssignments
			) {
				await tx.dutyManager.deleteMany({
					where: {
						id: id,
					},
				});

				await tx.dutyManager.createMany({
					data: updateStaffDto.dutyManagerAssignments!.map((venueId) => ({
						userId: staff.id,
						venueId,
					})),
				});
			}
			return staff;
		});
		return updatedStaff;
	}

	async deleteById(id: string, staff: StaffPayload) {
		const staffCount = await this.prisma.staff.count();

		if (staffCount > 0) {
			if (!staff) {
				throw new UnauthorizedException();
			}

			const requestAccount = await this.prisma.staff.findUniqueOrThrow({
				where: { id: staff.id },
			});

			if (requestAccount.role !== "ADMIN") {
				throw new UnauthorizedException();
			}
		}

		const deletedAccount = await this.prisma.staff.delete({
			where: {
				id: id,
			},
		});

		return `deleted account of ${deletedAccount.name}`;
	}

	private validateVenueAndDutyManagerAssignments(
		dto: CreateStaffDto | UpdateStaffDto,
	): void {
		if (
			dto.role === Role.VENUE_MANAGER &&
			!dto.venueManagerAssignments?.length
		) {
			throw new BadRequestException(
				"Venue manager role requires at least one venue assignment",
			);
		}
		if (dto.role === Role.DUTY_MANAGER && !dto.dutyManagerAssignments?.length) {
			throw new BadRequestException(
				"Duty manager role requires at least one venue assignment",
			);
		}
	}
}
