import { Controller, Post, Body, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
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
        files: 1
      },
      storage: multer.diskStorage({
        destination: 'uploads/uncompressed',
        filename: function (req, file, cb) {
          console.log(file)
          cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
        }
      })
    }),
  )
  create(@Req() req: express.Request, @UploadedFile() file: Express.Multer.File, @Body() createVenueDto: CreateVenueDto) {
    // need to add check for valid image extension, bSharp for compression, move image to compressed & return it & try catch to delete image if error is encountered
    return this.venuesService.create(req, file, createVenueDto);
  }
}
