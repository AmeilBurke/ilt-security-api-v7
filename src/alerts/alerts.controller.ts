import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import express from "express";
import multer from "multer";
import { Staff } from "src/staff/staff.decorator";
import { getBaseUrl, imageFileValidator } from "src/utils";
import { StaffPayload } from "src/utils/types";
import { v4 as uuidv4 } from "uuid";
import { AlertsService } from "./alerts.service";
import { CreateAlertDto } from "./dto/create-alert.dto";

@Controller("alerts")
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) { }

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
    @Body() createAlertDto: CreateAlertDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const baseUrl = getBaseUrl(req);
    return this.alertsService.create(baseUrl, staff, createAlertDto, file);
  }

  @Get()
  findAll(@Req() req: express.Request,) {
    const baseUrl = getBaseUrl(req);
    return this.alertsService.findAll(baseUrl);
  }

  @Delete()
  removeAll() {
    return this.alertsService.removeAll();
  }
}
