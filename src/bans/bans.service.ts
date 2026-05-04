import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateBanDto } from './dto/create-ban.dto';
import { UpdateBanDto } from './dto/update-ban.dto';
import { StaffPayload } from '@/utils/types';
import { PrismaService } from "src/prisma/prisma.service";
@Injectable()
export class BansService {

  constructor(private prisma: PrismaService) { }

  async create(
    staff: StaffPayload,
    createBanDto: CreateBanDto,
  ) {
    const requestAccount = await this.prisma.staff.findUniqueOrThrow({
      where: {
        id: staff.id,
      },
    });

    const newBan = await this.prisma.$transaction(async (tx) => {
      const ban = await tx.ban.create({
        data: {
          personId: createBanDto.personId,
          createdById: requestAccount.id,
          reason: createBanDto.reason,
          notes: createBanDto.notes,
          startDate: createBanDto.startDate,
          isBlanketBan: createBanDto.isBlanketBan,
          status: requestAccount.role === "ADMIN" ? "APPROVED" : "PENDING"
        },
        select: {
          id: true
        }
      })

      const venueBans = createBanDto.venueIds.map((venueId => {
        return {
          banId: ban.id,
          venueId: venueId,
          endDate: createBanDto.endDate
        }
      }))

      await tx.venueBan.createMany({
        data: venueBans
      })

      const fullBan = await tx.ban.findUnique({
        where: { id: ban.id },
        include: { venueBans: true }
      });

      return fullBan;
    })

    return newBan
  }

  async update(
    staff: StaffPayload,
    id: string,
    updateBanDto: UpdateBanDto
  ) {
    const requestAccount = await this.prisma.staff.findUniqueOrThrow({
      where: {
        id: staff.id,
      },
    });

    const updatedBan = await this.prisma.$transaction(async (tx) => {
      const ban = await tx.ban.update({
        where: {
          id: id
        },
        data: {
          personId: updateBanDto.personId,
          reason: updateBanDto.reason,
          notes: updateBanDto.notes,
          startDate: updateBanDto.startDate,
          isBlanketBan: updateBanDto.isBlanketBan,
          status: updateBanDto.status
        },
        select: {
          id: true,
        }
      })

      if (updateBanDto.venueIds && updateBanDto.endDate) {
        const endDate = updateBanDto.endDate;

        await tx.venueBan.deleteMany({
          where: { banId: ban.id }
        });

        const venueBans = updateBanDto.venueIds.map((venueId) => ({
          banId: ban.id,
          venueId,
          endDate,
        }));

        await tx.venueBan.createMany({
          data: venueBans
        });
      }

      const fullBan = await tx.ban.findUnique({
        where: { id: ban.id },
        include: { venueBans: true }
      });

      return fullBan;
    })
    return updatedBan;
  }

  async remove(
    staff: StaffPayload,
    id: string
  ) {
    const requestAccount = await this.prisma.staff.findUniqueOrThrow({
      where: { id: staff.id },
    });

    if (requestAccount.role !== "ADMIN") {
      throw new UnauthorizedException();
    }

    return await this.prisma.ban.delete({
      where: {
        id: id
      },
      include: {
        venueBans: true
      }
    })
  }
}
