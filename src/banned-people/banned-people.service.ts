import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateBannedPersonDto } from './dto/create-banned-person.dto';
import { UpdateBannedPersonDto } from './dto/update-banned-person.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import sharp from 'sharp';
import * as fs from 'fs';

@Injectable()
export class BannedPeopleService {
  constructor(private prisma: PrismaService) { }

  async create(
    baseUrl: string,
    file: Express.Multer.File,
    createBannedPersonDto: CreateBannedPersonDto,
  ) {
    try {
      await sharp(file.path)
        .webp({ quality: 75 })
        .toFile(`uploads/compressed/people/${file.filename}.webp`);

      await fs.promises.unlink(file.path);
    } catch (error) {
      await fs.promises.unlink(file.path).catch(() => { });
      throw new InternalServerErrorException('Image processing failed');
    }

    const newBannedPerson = await this.prisma.$transaction(async (tx) => {
      const bannedPerson = await tx.bannedPerson.create({
        data: {
          name: createBannedPersonDto.name,
          imagePath: `${file.filename}.webp`,
        },
        include: {
          bans: true,
        },
      });

      const ban = await tx.ban.create({
        data: {
          personId: bannedPerson.id,
          createdById: createBannedPersonDto.createdById, // need to swap with id from jwt token when added
          reason: createBannedPersonDto.reason,
          notes: createBannedPersonDto.notes,
          startDate: createBannedPersonDto.startDate,
          duration: createBannedPersonDto.duration,
          isBlanketBan: Boolean(createBannedPersonDto.isBlanketBan),
          status: 'PENDING', // change to approved if upload is done by an admin
        },
      });

      return { ...bannedPerson, bans: [ban] };
    });

    return {
      ...newBannedPerson,
      imagePath: `${baseUrl}/uploads/compressed/people/${newBannedPerson.imagePath}`,
    };
  }
  // need to test in postman

  async findAllBlanketBanned(baseUrl: string) {
    const blanketBanned = await this.prisma.bannedPerson.findMany({
      where: {
        bans: {
          some: {
            isBlanketBan: true,
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

  async findAllByVenueId(baseUrl: string, venueId: string) {
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

  async findOneById(baseUrl: string, id: string) {
    const person = await this.prisma.bannedPerson.findMany({
      where: {
        id: id
      },
      include: {
        bans: true,
      },
    });

    return person.map((details) => {
      return {
        ...details,
        imagePath: `${baseUrl}/uploads/compressed/people/${details.imagePath}`,
      };
    });
  }

  async updateOneById(baseUrl: string, id: string, updateBannedPersonDto: UpdateBannedPersonDto, file: Express.Multer.File | undefined,) {
    if (file) {
      const outdatedDetails = await this.prisma.bannedPerson.findUnique({
        where: {
          id: id
        }
      })

      console.log(outdatedDetails);

      try {
        await sharp(file.path)
          .webp({ quality: 75 })
          .toFile(`uploads/compressed/people/${file.filename}.webp`);

        await fs.promises.unlink(file.path);
        await fs.promises.unlink(`uploads/compressed/people/${outdatedDetails?.imagePath}`);
      } catch (error) {
        await fs.promises.unlink(file.path).catch(() => { });
        throw new InternalServerErrorException('Image processing failed');
      }
    }

    const updatedDetails = await this.prisma.bannedPerson.update({
      where: {
        id: id
      },
      data: {
        name: updateBannedPersonDto.name,
        imagePath: file ? `${file.filename}.webp` : undefined,
      }
    })

    return {
      ...updatedDetails,
      imagePath: `${baseUrl}/uploads/compressed/people/${updatedDetails.imagePath}`,
    }
  }
}
