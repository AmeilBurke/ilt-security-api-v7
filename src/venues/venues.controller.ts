import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
} from '@nestjs/common';
import express from 'express';
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

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
        if (file &&
          (file.mimetype === 'image/png' ||
            file.mimetype === 'image/webp' ||
            file.mimetype === 'image/jpeg')
        ) {
          callback(null, true);
        } else {
          callback(new BadRequestException('File given is not a png, webp or jpeg'), false);
        }
      },
    }),
  )
  create(
    @Req() req: express.Request,
    @UploadedFile() file: Express.Multer.File,
    @Body() createVenueDto: CreateVenueDto,
  ) {
    // try catch to delete image if error is encountered
    return this.venuesService.create(req, file, createVenueDto);
  }
}
