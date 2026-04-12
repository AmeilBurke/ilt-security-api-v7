import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
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
import { BannedPeopleService } from "./banned-people.service";
import { CreateBannedPersonDto } from "./dto/create-banned-person.dto";
import { UpdateBannedPersonDto } from "./dto/update-banned-person.dto";

@Controller("banned-people")
export class BannedPeopleController {
	constructor(private readonly bannedPeopleService: BannedPeopleService) {}

	@Post()
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
	create(
		@Req() req: express.Request,
		@Staff() staff: StaffPayload,
		@UploadedFile() file: Express.Multer.File,
		@Body() createBannedPersonDto: CreateBannedPersonDto,
	) {
		const baseUrl = getBaseUrl(req);
		return this.bannedPeopleService.create(
			baseUrl,
			staff,
			file,
			createBannedPersonDto,
		);
	}

	@Get("/blanket-banned")
	findAllBlanketBanned(@Req() req: express.Request) {
		const baseUrl = getBaseUrl(req);
		return this.bannedPeopleService.findAllBlanketBanned(baseUrl);
	}

	@Get("/venue/:id")
	findAllByVenueId(@Req() req: express.Request, @Param("id") id: string) {
		const baseUrl = getBaseUrl(req);
		return this.bannedPeopleService.findAllByVenueId(baseUrl, id);
	}

	@Get(":id")
	findOneById(@Req() req: express.Request, @Param("id") id: string) {
		const baseUrl = getBaseUrl(req);
		return this.bannedPeopleService.findOneById(baseUrl, id);
	}

	@Patch(":id")
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
	updateOneById(
		@Req() req: express.Request,
		@Param("id") id: string,
		@Body() updateBannedPersonDto: UpdateBannedPersonDto,
		@UploadedFile() file?: Express.Multer.File,
	) {
		const baseUrl = getBaseUrl(req);
		return this.bannedPeopleService.updateOneById(
			baseUrl,
			id,
			updateBannedPersonDto,
			file,
		);
	}
}
