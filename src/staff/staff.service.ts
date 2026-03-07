import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hashPassword } from 'src/utils';
import { Role } from '@prisma/client';
import { StaffFrontEnd } from 'src/utils/types';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async create(createStaffDto: CreateStaffDto): Promise<string> {
    if (createStaffDto.role === Role.VENUE_MANAGER) {
      if (
        !createStaffDto.venueManagerAssignments ||
        createStaffDto.venueManagerAssignments.length === 0
      ) {
        throw new BadRequestException(
          'Venue manager role requires at least one venue assignment',
        );
      }
    }

    if (createStaffDto.role === Role.DUTY_MANAGER) {
      if (
        !createStaffDto.dutyManagerAssignments ||
        createStaffDto.dutyManagerAssignments.length === 0
      ) {
        throw new BadRequestException(
          'Duty manager role requires at least one venue assignment',
        );
      }
    }

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
}
