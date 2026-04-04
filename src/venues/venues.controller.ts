import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Req,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import express from 'express';
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { getBaseUrl, imageFileValidator } from 'src/utils';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { Staff } from 'src/staff/staff.decorator';
import type { StaffPayload } from 'src/utils/types';

@Controller('venues')
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) { }

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        files: 1,
      },
      storage: multer.diskStorage({
        destination: 'uploads/uncompressed',
        filename: function (req, file, callback) {
          callback(null, `${uuidv4()}`);
        },
      }),
      fileFilter(req, file, callback) {
        imageFileValidator(file, callback);
      },
    }),
  )
  create(
    @Req() req: express.Request,
    @Staff() staff: StaffPayload,
    @UploadedFile() file: Express.Multer.File,
    @Body() createVenueDto: CreateVenueDto,
  ) {
    const baseUrl = getBaseUrl(req);
    return this.venuesService.create(baseUrl, staff, file, createVenueDto);
  }

  @Get()
  findAll(@Req() req: express.Request) {
    const baseUrl = getBaseUrl(req);
    return this.venuesService.findAll(baseUrl);
  }

  @Get(':id')
  findOneById(@Req() req: express.Request, @Param('id') id: string,) {
    const baseUrl = getBaseUrl(req);
    return this.venuesService.findOneById(baseUrl, id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        files: 1,
      },
      storage: multer.diskStorage({
        destination: 'uploads/uncompressed',
        filename: function (req, file, callback) {
          callback(null, `${uuidv4()}`);
        },
      }),
      fileFilter(req, file, callback) {
        imageFileValidator(file, callback);
      },
    }),
  )
  updateOneById(
    @Req() req: express.Request,
    @Staff() staff: StaffPayload,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateVenueDto: UpdateVenueDto,
  ) {
    const baseUrl = getBaseUrl(req);
    console.log(baseUrl);

    return this.venuesService.updateOneById(baseUrl, staff, id, file, updateVenueDto);
  }

  @Delete(':id')
  deleteOneById(@Req() req: express.Request, @Param('id') id: string) {
    return this.venuesService.deleteOneById(id);
  }
}
