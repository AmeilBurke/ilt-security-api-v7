import { Injectable } from '@nestjs/common';
import { CreateVenueDto } from './dto/create-venue.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, PrismaClient, Role } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { Request } from 'express';

@Injectable()
export class VenuesService {
  constructor(private prisma: PrismaService) { }

  async create(req: Request, file: Express.Multer.File, createVenueDto: CreateVenueDto) {
    const newVenue = await this.prisma.$transaction(async (tx) => {
      const venue = await this.prisma.venue.create({
        data: {
          name: createVenueDto.name,
          imagePath: file.filename,
          address: createVenueDto.address,
          phone: createVenueDto.phone,
        },
        include: {
          venueManagers: true,
          dutyManagers: true
        }
      });

      if (createVenueDto.venueManagers || createVenueDto.dutyManagers) {
        this.addVenueAndDutyManagersToVenue(venue.id, createVenueDto, tx)
      }
      return venue
    });
    console.log(newVenue)
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // return newVenue
    return {...newVenue, imagePath: `${baseUrl}/uploads/uncompressed/${file.filename}`}
  }

  private async addVenueAndDutyManagersToVenue(venueId: string, createVenueDto: CreateVenueDto, tx: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">) {
    if (createVenueDto.venueManagers) {
      const venueManagerIds = await tx.staff.findMany({
        where: {
          id: {
            in: createVenueDto.venueManagers,
          },
        },
        select: {
          id: true,
        },
      });

      await tx.venueManager.createMany({
        data: createVenueDto.venueManagers.map((venueManagerIds) => ({
          userId: venueManagerIds,
          venueId: venueId,
        })),
      });
    }

    if (createVenueDto.dutyManagers) {
      const dutyManagerIds = await tx.staff.findMany({
        where: {
          id: {
            in: createVenueDto.dutyManagers,
          },
        },
        select: {
          id: true,
        },
      });

      await tx.venueManager.createMany({
        data: createVenueDto.dutyManagers.map((dutyManagerIds) => ({
          userId: dutyManagerIds,
          venueId: venueId,
        })),
      });
    }
  }
}
