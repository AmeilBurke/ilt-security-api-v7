import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Req,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { Public } from 'src/authentication/public.decorator';
import type { StaffPayload } from 'src/utils/types';
import { Staff } from './staff.decorator';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) { }

  @Public()
  @Post()
  create(@Body() createStaffDto: CreateStaffDto, @Staff() staff?: StaffPayload,) {
    return this.staffService.create(createStaffDto, staff);
  }

  @Get()
  findAll() {
    return this.staffService.findAll();
  }

  @Get(':id')
  findOneById(@Param('id') id: string) {
    return this.staffService.findOneById(id);
  }

  @Patch(':id')
  updateOneById(
    @Staff() staff: StaffPayload,
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
  ) {
    return this.staffService.updateById(staff, id, updateStaffDto);
  }

  @Delete(':id')
  deleteById(@Param('id') id: string) {
    return this.staffService.deleteById(id);
  }
}
