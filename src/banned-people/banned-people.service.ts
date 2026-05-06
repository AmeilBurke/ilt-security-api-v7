import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import * as fs from "fs";
import sharp from "sharp";
import { PrismaService } from "src/prisma/prisma.service";
import { StaffPayload } from "src/utils/types";
import { CreateBannedPersonDto } from "./dto/create-banned-person.dto";
import { UpdateBannedPersonDto } from "./dto/update-banned-person.dto";
import { Prisma } from "@/generated/prisma/client";
import { BannedPerson } from "@prisma/client";

@Injectable()
export class BannedPeopleService {
	constructor(private prisma: PrismaService) { }

	async create(
		baseUrl: string,
		staff: StaffPayload,
		file: Express.Multer.File,
		createBannedPersonDto: CreateBannedPersonDto,
	): Promise<Prisma.BannedPersonGetPayload<{ include: { bans: { include: { venueBans: true } } } }>> {

		// if venue manager sends ban through auto approve for venues they are a part of

		if (!file) {
			throw new BadRequestException("No image was given")
		}

		try {
			await sharp(file.path)
				.webp({ quality: 75 })
				.toFile(`uploads/compressed/people/${file.filename}.webp`);

			await fs.promises.unlink(file.path);
		} catch (error) {
			await fs.promises.unlink(file.path).catch(() => { });
			throw new InternalServerErrorException("Image processing failed");
		}

		const requestAccount = await this.prisma.staff.findUniqueOrThrow({
			where: {
				id: staff.id,
			},
		});

		const newBannedPerson = await this.prisma.$transaction(async (tx) => {
			const bannedPerson = await tx.bannedPerson.create({
				data: {
					name: createBannedPersonDto.name,
					imagePath: `${file.filename}.webp`,
				},
			});

			const ban = await tx.ban.create({
				data: {
					personId: bannedPerson.id,
					createdById: requestAccount.id,
					reason: createBannedPersonDto.reason,
					notes: createBannedPersonDto.notes,
					startDate: createBannedPersonDto.startDate,
					isBlanketBan: createBannedPersonDto.isBlanketBan === "true" ? true : false,
					status: requestAccount.role === "ADMIN" ? "APPROVED" : "PENDING"
				},
			});

			const venueBans = createBannedPersonDto.venueIds.map((venueId: string) => {
				return {
					banId: ban.id,
					venueId: venueId,
					endDate: createBannedPersonDto.endDate,
				}
			})

			await tx.venueBan.createMany({
				data: venueBans
			})

			const fullBan = await tx.ban.findUniqueOrThrow({
				where: { id: ban.id },
				include: { venueBans: true }
			});

			return { ...bannedPerson, bans: [fullBan] };
		});

		return {
			...newBannedPerson,
			imagePath: `${baseUrl}/uploads/compressed/people/${newBannedPerson.imagePath}`,
		};
	}

	async findAllBlanketBanned(baseUrl: string): Promise<Prisma.BannedPersonGetPayload<{ include: { bans: true } }>[]> {
		const blanketBanned = await this.prisma.bannedPerson.findMany({
			where: {
				bans: {
					some: {
						isBlanketBan: true,
						NOT: {
							status: "PENDING"
						}
					},
				},
			},
			include: {
				bans: true,
			},
		});

		return blanketBanned.map((person) => {
			return {
				...person,
				imagePath: `${baseUrl}/uploads/compressed/people/${person.imagePath}`,
			};
		});
	}

	async findAllByVenueId(baseUrl: string, venueId: string): Promise<Prisma.BannedPersonGetPayload<{ include: { bans: true } }>[]> {
		const bannedFromVenue = await this.prisma.bannedPerson.findMany({
			where: {
				bans: {
					some: {
						venueBans: {
							some: {
								venueId: venueId,
							},
						},
					},
				},
			},
			include: {
				bans: true,
			},
		});

		return bannedFromVenue.map((person) => {
			return {
				...person,
				imagePath: `${baseUrl}/uploads/compressed/people/${person.imagePath}`,
			};
		});
	}

	async findAllPending(baseUrl: string, staff: StaffPayload): Promise<Prisma.BannedPersonGetPayload<{ include: { bans: true } }>[]> {
		const findAllWithPendingBan = await this.prisma.bannedPerson.findMany({
			where: {
				bans: {
					some: {
						status: {
							equals: "PENDING"
						},
					},
				},
			},
			include: {
				bans: true,
			},
		});

		return findAllWithPendingBan.map((person) => {
			return {
				...person,
				imagePath: `${baseUrl}/uploads/compressed/people/${person.imagePath}`,
			};
		});
	}

	async findAllWithActiveBan(baseUrl: string, staff: StaffPayload): Promise<Prisma.BannedPersonGetPayload<{ include: { bans: true } }>[]> {
		const findAllWithActiveBan = await this.prisma.bannedPerson.findMany({
			where: {
				bans: {
					some: {
						AND: {
							venueBans: {
								some: {
									endDate: {
										gt: new Date()
									}
								}
							},
							isBlanketBan: false
						}
					}
				}
			},
			include: {
				bans: {
					include: {
						venueBans: true
					}
				}
			}
		});

		return findAllWithActiveBan.map((person) => {
			return {
				...person,
				imagePath: `${baseUrl}/uploads/compressed/people/${person.imagePath}`,
			};
		});
	}

	async findOneById(baseUrl: string, id: string): Promise<Prisma.BannedPersonGetPayload<{ include: { bans: true } }>> {
		const person = await this.prisma.bannedPerson.findUniqueOrThrow({
			where: {
				id: id,
			},
			include: {
				bans: true,
			},
		});
		return {
			...person,
			imagePath: `${baseUrl}/uploads/compressed/people/${person.imagePath}`,
		};
	}

	async findAll(baseUrl: string): Promise<Prisma.BannedPersonGetPayload<{ include: { alerts: true } }>[]> {
		const person = await this.prisma.bannedPerson.findMany({
			include: {
				alerts: true
			}
		});

		return person.map((details) => {
			return {
				...details,
				imagePath: `${baseUrl}/uploads/compressed/people/${details.imagePath}`,
			};
		});
	}

	async updateOneById(
		baseUrl: string,
		id: string,
		updateBannedPersonDto: UpdateBannedPersonDto,
		file: Express.Multer.File | undefined,
	): Promise<BannedPerson> {
		if (file) {
			const outdatedDetails = await this.prisma.bannedPerson.findUnique({
				where: {
					id: id,
				},
			});

			try {
				await sharp(file.path)
					.webp({ quality: 75 })
					.toFile(`uploads/compressed/people/${file.filename}.webp`);

				await fs.promises.unlink(file.path);
				await fs.promises.unlink(
					`uploads/compressed/people/${outdatedDetails?.imagePath}`,
				);
			} catch (error) {
				await fs.promises.unlink(file.path).catch(() => { });
				throw new InternalServerErrorException("Image processing failed");
			}
		}

		const updatedDetails = await this.prisma.bannedPerson.update({
			where: {
				id: id,
			},
			data: {
				name: updateBannedPersonDto.name,
				imagePath: file ? `${file.filename}.webp` : undefined,
			},
		});

		return {
			...updatedDetails,
			imagePath: `${baseUrl}/uploads/compressed/people/${updatedDetails.imagePath}`,
		};
	}
}
