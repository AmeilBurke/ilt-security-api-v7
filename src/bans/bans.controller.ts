import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { BansService } from './bans.service';
import { CreateBanDto } from './dto/create-ban.dto';
import { UpdateBanDto } from './dto/update-ban.dto';
import { Staff } from '@/staff/staff.decorator';
import { StaffPayload } from '@/utils/types';
import express from "express";
import { getBaseUrl } from '@/utils';

@Controller('bans')
export class BansController {
  constructor(private readonly bansService: BansService) { }


  @Post()
  create(
    @Staff() staff: StaffPayload,
    @Body() createBanDto: CreateBanDto
  ) {
    return this.bansService.create(staff, createBanDto);
  }

  @Get("/pending")
  findAllPending(@Req() req: express.Request, @Staff() staff: StaffPayload,) {
    const baseUrl = getBaseUrl(req);
    return this.bansService.findAllPending(baseUrl, staff);
  }

  @Patch(':id')
  update(
    @Staff() staff: StaffPayload,
    @Param('id') id: string,
    @Body() updateBanDto: UpdateBanDto
  ) {
    console.log(updateBanDto)
    return this.bansService.update(staff, id, updateBanDto);
  }

  @Delete(':id')
  remove(@Staff() staff: StaffPayload, @Param('id') id: string) {
    return this.bansService.remove(staff, id);
  }
}
