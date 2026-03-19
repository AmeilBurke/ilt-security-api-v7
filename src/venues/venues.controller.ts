import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import express from 'express';
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { getBaseUrl, imageFileValidator } from 'src/utils';
import { UpdateVenueDto } from './dto/update-venue.dto';

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
        imageFileValidator(file, callback)
      },
    }),
  )
  create(
    @Req() req: express.Request,
    @UploadedFile() file: Express.Multer.File,
    @Body() createVenueDto: CreateVenueDto,
  ) {
    const baseUrl = getBaseUrl(req);
    return this.venuesService.create(baseUrl, file, createVenueDto);
  }

  @Get()
  findAll(@Req() baseUrl: string) {
    return this.venuesService.findAll(baseUrl);
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
        imageFileValidator(file, callback)
      },
    }),
  )
  updateOneById(
    @Req() req: express.Request,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateVenueDto: UpdateVenueDto,
  ) {
    const baseUrl = getBaseUrl(req);
    console.log(baseUrl)

    return this.venuesService.updateOneById(baseUrl, id, file, updateVenueDto);
  }
}
