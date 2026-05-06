import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateBanDto } from './dto/create-ban.dto';
import { UpdateBanDto } from './dto/update-ban.dto';
import { StaffPayload } from '@/utils/types';
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma, Role } from '@/generated/prisma/client';

@Injectable()
export class BansService {

  constructor(private prisma: PrismaService) { }

  async create(
    staff: StaffPayload,
    createBanDto: CreateBanDto,
  ): Promise<Prisma.BanGetPayload<{ include: { venueBans: true } }>> {
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

      const fullBan = await tx.ban.findUniqueOrThrow({
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
  ): Promise<Prisma.BanGetPayload<{ include: { venueBans: true } }>> {
    const requestAccount = await this.prisma.staff.findUniqueOrThrow({
      where: {
        id: staff.id,
      },
    });

    if (requestAccount.role !== Role.ADMIN) {
      throw new UnauthorizedException();
    }

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

      const fullBan = await tx.ban.findUniqueOrThrow({
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
  ): Promise<Prisma.BanGetPayload<{ include: { venueBans: true } }>> {
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
