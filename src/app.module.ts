import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { StaffModule } from './staff/staff.module';
import { VenuesModule } from './venues/venues.module';
import { BannedPeopleModule } from './banned-people/banned-people.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    StaffModule,
    VenuesModule,
    BannedPeopleModule,
    AuthenticationModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
