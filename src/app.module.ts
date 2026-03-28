import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { StaffModule } from './staff/staff.module';
import { VenuesModule } from './venues/venues.module';
import { BannedPeopleModule } from './banned-people/banned-people.module';

@Module({
  imports: [PrismaModule, StaffModule, VenuesModule, BannedPeopleModule],
  controllers: [],
  providers: [],
})
export class AppModule {}