import { Controller, Post, Body } from '@nestjs/common';
import { VenueBansService } from './venue-bans.service';
import { CreateVenueBanDto } from './dto/create-venue-ban.dto';
import { Staff } from '@/staff/staff.decorator';
import { StaffPayload } from '@/utils/types';

@Controller('venue-bans')
export class VenueBansController {
  constructor(private readonly venueBansService: VenueBansService) { }

  @Post()
  create(@Staff() staff: StaffPayload, @Body() createVenueBanDto: CreateVenueBanDto) {
    return this.venueBansService.create(staff, createVenueBanDto);
  }
}
