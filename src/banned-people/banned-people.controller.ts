import { Controller, Post, Body, UseInterceptors, Req, UploadedFile, Get } from '@nestjs/common';
import { BannedPeopleService } from './banned-people.service';
import { CreateBannedPersonDto } from './dto/create-banned-person.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { getBaseUrl, imageFileValidator } from 'src/utils';
import { v4 as uuidv4 } from 'uuid';
import express from 'express';

@Controller('banned-people')
export class BannedPeopleController {
  constructor(private readonly bannedPeopleService: BannedPeopleService) { }

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
  create(@Req() req: express.Request,
    @UploadedFile() file: Express.Multer.File, @Body() createBannedPersonDto: CreateBannedPersonDto) {
    const baseUrl = getBaseUrl(req);
    return this.bannedPeopleService.create(baseUrl, file, createBannedPersonDto);
  }
  
  @Get()
  findAll(@Req() req: express.Request) {
    const baseUrl = getBaseUrl(req);
    return this.bannedPeopleService.findAll(baseUrl);
  }
}
