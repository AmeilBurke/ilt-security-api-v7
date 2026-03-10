import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { StaffModule } from './staff/staff.module';
import { VenuesModule } from './venues/venues.module';

@Module({
  imports: [PrismaModule, StaffModule, VenuesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}