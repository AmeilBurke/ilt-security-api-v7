import { Controller, Post, Body, Get, Param, Patch, Delete } from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) { }

  @Post()
  create(@Body() createStaffDto: CreateStaffDto) {
    return this.staffService.create(createStaffDto);
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
  updateOneById(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.staffService.updateById(id, updateStaffDto);
  }

  @Delete(':id')
  deleteById(@Param('id') id: string) {
    return this.staffService.deleteById(id)
  }
}
