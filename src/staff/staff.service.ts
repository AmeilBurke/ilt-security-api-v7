import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hashPassword } from 'src/utils';
import { Role } from '@prisma/client';
import { StaffFrontEnd } from 'src/utils/types';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async create(createStaffDto: CreateStaffDto): Promise<string> {
    // check if requester is admin when jwt token is implemented

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
        name: 'asc',
      },
      include: {
        venueManagerAssignments: true,
        dutyManagerAssignments: true,
      },
    });
  }

  async findOneById(id: string): Promise<StaffFrontEnd> {
    return this.prisma.staff.findUniqueOrThrow({
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

  async updateById(
    id: string,
    updateStaffDto: UpdateStaffDto,
  ): Promise<StaffFrontEnd> {
    // check if requester is admin when jwt token is implemented

    this.validateVenueAndDutyManagerAssignments(updateStaffDto);

    let hashedPassword: string | undefined = undefined;

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
    // return `updated details for ${updatedStaff.name}`;
    return updatedStaff;
  }

  async deleteById(id: string) {
    const deletedAccount = await this.prisma.staff.delete({
      where: {
        id: id,
      },
    });

    return `deleted account of ${deletedAccount.name}`
  }

  private validateVenueAndDutyManagerAssignments(
    dto: CreateStaffDto | UpdateStaffDto,
  ): void {
    if (
      dto.role === Role.VENUE_MANAGER &&
      !dto.venueManagerAssignments?.length
    ) {
      throw new BadRequestException(
        'Venue manager role requires at least one venue assignment',
      );
    }
    if (dto.role === Role.DUTY_MANAGER && !dto.dutyManagerAssignments?.length) {
      throw new BadRequestException(
        'Duty manager role requires at least one venue assignment',
      );
    }
  }
}
