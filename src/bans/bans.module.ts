import { Module } from '@nestjs/common';
import { BansService } from './bans.service';
import { BansController } from './bans.controller';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  controllers: [BansController],
  providers: [BansService, PrismaService],
})
export class BansModule { }
