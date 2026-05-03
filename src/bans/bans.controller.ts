import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { BansService } from './bans.service';
import { CreateBanDto } from './dto/create-ban.dto';
import { UpdateBanDto } from './dto/update-ban.dto';
import { Staff } from '@/staff/staff.decorator';
import { StaffPayload } from '@/utils/types';
import express from "express";
import { getBaseUrl, imageFileValidator } from '@/utils';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { v4 as uuidv4 } from "uuid";

@Controller('bans')
export class BansController {
  constructor(private readonly bansService: BansService) { }

  @UseInterceptors(
    FileInterceptor("image", {
      limits: {
        files: 1,
      },
      storage: multer.diskStorage({
        destination: "uploads/uncompressed",
        filename: (req, file, callback) => {
          callback(null, `${uuidv4()}`);
        },
      }),
      fileFilter(req, file, callback) {
        imageFileValidator(file, callback);
      },
    }),
  )
  @Post()
  create(
    @Req() req: express.Request,
    @Staff() staff: StaffPayload,
    @Body() createBanDto: CreateBanDto,
    @UploadedFile() file?: Express.Multer.File) {
    const baseUrl = getBaseUrl(req);

    return this.bansService.create(baseUrl, staff, createBanDto, file);
  }

  @Get()
  findAll() {
    return this.bansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bansService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBanDto: UpdateBanDto) {
    return this.bansService.update(+id, updateBanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bansService.remove(+id);
  }
}
