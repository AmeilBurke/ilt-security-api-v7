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
          bans: true
        }
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

  async findAll(baseUrl: string) {
    return await this.prisma.bannedPerson.findMany({
      include: {
        bans: true
      }
    })
  }
}
