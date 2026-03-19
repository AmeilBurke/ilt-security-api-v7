import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateVenueDto } from './dto/create-venue.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { Request } from 'express';
import sharp from 'sharp';
import * as fs from 'fs';

@Injectable()
export class VenuesService {
  constructor(private prisma: PrismaService) { }

  async create(
    req: Request,
    file: Express.Multer.File,
    createVenueDto: CreateVenueDto,
  ) {
    try {
      await sharp(file.path)
        .webp({ quality: 75 })
        .toFile(`uploads/compressed/venues/${file.filename}.webp`);

      await fs.promises.unlink(file.path);
    } catch (error) {
      await fs.promises.unlink(file.path).catch(() => { });
      throw new InternalServerErrorException('Image processing failed');
    }

    const newVenue = await this.prisma.$transaction(async (tx) => {
      const venue = await this.prisma.venue.create({
        data: {
          name: createVenueDto.name,
          imagePath: `${file.filename}.webp`,
          address: createVenueDto.address,
          phone: createVenueDto.phone,
        },
        include: {
          venueManagers: true,
          dutyManagers: true,
        },
      });

      if (createVenueDto.venueManagers || createVenueDto.dutyManagers) {
        await this.addVenueAndDutyManagersToVenue(venue.id, createVenueDto, tx);
      }
      return venue;
    });
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    console.log(newVenue)

    return {
      ...newVenue,
      imagePath: `${baseUrl}/uploads/compressed/venues/${newVenue.imagePath}`,
    };
  }

  private async addVenueAndDutyManagersToVenue(
    venueId: string,
    createVenueDto: CreateVenueDto,
    tx: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
    >,
  ) {
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
        data: venueManagerIds.map((venueManagerIds) => ({
          userId: venueManagerIds.id,
          venueId: venueId,
        })),
      });
    }

    if (createVenueDto.dutyManagers) {
      await tx.staff.findMany({
        where: {
          id: {
            in: createVenueDto.dutyManagers,
          },
        },
        select: {
          id: true,
        },
      });

      await tx.dutyManager.createMany({
        data: createVenueDto.dutyManagers.map((dutyManagerIds) => ({
          userId: dutyManagerIds,
          venueId: venueId,
        })),
      });
    }
  }
}
