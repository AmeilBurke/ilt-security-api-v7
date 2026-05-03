import { Injectable } from '@nestjs/common';
import { CreateBanDto } from './dto/create-ban.dto';
import { UpdateBanDto } from './dto/update-ban.dto';
import { StaffPayload } from '@/utils/types';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class BansService {

  constructor(private prisma: PrismaService) { }

  create(
    baseUrl: string,
    staff: StaffPayload,
    createBanDto: CreateBanDto,
    file?: Express.Multer.File
  ) {
    // if(createBanDto.personId)
  }

  findAll() {
    return `This action returns all bans`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ban`;
  }

  update(id: number, updateBanDto: UpdateBanDto) {
    return `This action updates a #${id} ban`;
  }

  remove(id: number) {
    return `This action removes a #${id} ban`;
  }
}
