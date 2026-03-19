import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateVenueDto } from './dto/create-venue.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import sharp from 'sharp';
import * as fs from 'fs';
import { UpdateVenueDto } from './dto/update-venue.dto';

@Injectable()
export class VenuesService {
  constructor(private prisma: PrismaService) { }

  async create(
    baseUrl: string,
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
      const venue = await tx.venue.create({
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

    return {
      ...newVenue,
      imagePath: `${baseUrl}/uploads/compressed/venues/${newVenue.imagePath}`,
    };
  }

  async findAll(baseUrl: string) {
    const allVenues = await this.prisma.venue.findMany();
    return allVenues.map((venue) => {
      return {
        ...venue,
        imagePath: `${baseUrl}/uploads/compressed/venues/${venue.imagePath}`,
      };
    });
  }

  async findOneById(baseUrl: string, id: string) {
    const venue = await this.prisma.venue.findUniqueOrThrow({
      where: {
        id: id,
      },
    });

    return {
      ...venue,
      imagePath: `${baseUrl}/uploads/compressed/venues/${venue.imagePath}`,
    };
  }

  async updateOneById(
    baseUrl: string,
    id: string,
    file: Express.Multer.File,
    updateVenueDto: UpdateVenueDto,
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

    const updatedVenue = await this.prisma.$transaction(async (tx) => {
      const venue = await this.prisma.venue.update({
        where: {
          id: id,
        },
        data: {
          name: updateVenueDto.name,
          imagePath: `${file.filename}.webp`,
          address: updateVenueDto.address,
          phone: updateVenueDto.phone,
        },
      });

      if (updateVenueDto.venueManagers || updateVenueDto.dutyManagers) {
        if (updateVenueDto.venueManagers) {
          await tx.venueManager.deleteMany({
            where: {
              venueId: venue.id,
            },
          });
        }

        if (updateVenueDto.dutyManagers) {
          await tx.dutyManager.deleteMany({
            where: {
              venueId: venue.id,
            },
          });
        }

        await this.addVenueAndDutyManagersToVenue(
          venue.id,
          updateVenueDto,
          tx,
        );
      }
      return venue
    });
    return {
      ...updateVenueDto,
      imagePath: `${baseUrl}/uploads/compressed/venues/${updatedVenue.imagePath}`,
    };
  }

  private async addVenueAndDutyManagersToVenue(
    venueId: string,
    venueDto: CreateVenueDto | UpdateVenueDto,
    tx: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
    >,
  ) {
    if (venueDto.venueManagers) {
      const venueManagerIds = await tx.staff.findMany({
        where: {
          id: {
            in: venueDto.venueManagers,
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

    if (venueDto.dutyManagers) {
      await tx.staff.findMany({
        where: {
          id: {
            in: venueDto.dutyManagers,
          },
        },
        select: {
          id: true,
        },
      });

      await tx.dutyManager.createMany({
        data: venueDto.dutyManagers.map((dutyManagerIds) => ({
          userId: dutyManagerIds,
          venueId: venueId,
        })),
      });
    }
  }
}
