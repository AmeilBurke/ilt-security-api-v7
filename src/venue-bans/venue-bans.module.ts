import { Module } from '@nestjs/common';
import { VenueBansService } from './venue-bans.service';
import { VenueBansController } from './venue-bans.controller';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  controllers: [VenueBansController],
  providers: [VenueBansService, PrismaService],
})
export class VenueBansModule {}
