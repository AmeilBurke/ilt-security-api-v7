import { Controller, Post, Body, UseInterceptors, Req, UploadedFile, Get, Param, Patch } from '@nestjs/common';
import { BannedPeopleService } from './banned-people.service';
import { CreateBannedPersonDto } from './dto/create-banned-person.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { getBaseUrl, imageFileValidator } from 'src/utils';
import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import { UpdateBannedPersonDto } from './dto/update-banned-person.dto';

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

  @Get('/blanket-banned')
  findAllBlanketBanned(@Req() req: express.Request) {
    const baseUrl = getBaseUrl(req);
    return this.bannedPeopleService.findAllBlanketBanned(baseUrl);
  }

  @Get('/venue/:id')
  findAllByVenueId(@Req() req: express.Request, @Param('id') id: string,) {
    const baseUrl = getBaseUrl(req);
    return this.bannedPeopleService.findAllByVenueId(baseUrl, id);
  }

  @Get(':id')
  findOneById(@Req() req: express.Request, @Param('id') id: string,) {
    const baseUrl = getBaseUrl(req);
    return this.bannedPeopleService.findOneById(baseUrl, id);
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
  updateOneById(@Req() req: express.Request, @Param('id') id: string, @Body() updateBannedPersonDto: UpdateBannedPersonDto, @UploadedFile() file?: Express.Multer.File) {
    const baseUrl = getBaseUrl(req);
    return this.bannedPeopleService.updateOneById(baseUrl, id, updateBannedPersonDto, file);
  }
}
