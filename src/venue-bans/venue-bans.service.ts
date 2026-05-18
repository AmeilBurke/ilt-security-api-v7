import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateVenueBanDto } from './dto/create-venue-ban.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { StaffPayload } from '@/utils/types';
import { Role } from '@/generated/prisma/enums';
import { BatchPayload } from '@/generated/prisma/internal/prismaNamespace';

@Injectable()
export class VenueBansService {
  constructor(private prisma: PrismaService) { }

  async create(staff: StaffPayload, createVenueBanDto: CreateVenueBanDto): Promise<BatchPayload> {
    const requestAccount = await this.prisma.staff.findUniqueOrThrow({
      where: {
        id: staff.id
      }
    })

    if (requestAccount.role !== Role.ADMIN) {
      throw new UnauthorizedException("Account not admin")
    }

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.venueBan.deleteMany({
        where: {
          banId: createVenueBanDto.banId
        }
      })

      const venueBans = createVenueBanDto.venueDetails.map((venueDetails) => {
        return {
          banId: createVenueBanDto.banId,
          venueId: venueDetails.venueId,
          endDate: venueDetails.endDate
        }
      })

      return await tx.venueBan.createMany({
        data: venueBans
      })
    })

    return result;
  }
}
