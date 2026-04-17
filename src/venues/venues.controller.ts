import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Req,
	UploadedFile,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import  express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { Public } from "@/authentication/public.decorator";
import { Staff } from "@/staff/staff.decorator";
import { getBaseUrl, imageFileValidator } from "@/utils";
import { StaffPayload } from "@/utils/types";
import { CreateVenueDto } from "./dto/create-venue.dto";
import { UpdateVenueDto } from "./dto/update-venue.dto";
import { VenuesService } from "./venues.service";

@Controller("venues")
export class VenuesController {
	constructor(private readonly venuesService: VenuesService) { }

	@Public()
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

	// @Public()
	// @Get('/count')
	// findVenueCount() {
	//   return this.venuesService.findVenueCount()
	// }

	@Get(":id")
	findOneById(@Req() req: express.Request, @Param("id") id: string) {
		const baseUrl = getBaseUrl(req);
		return this.venuesService.findOneById(baseUrl, id);
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
		@Staff() staff: StaffPayload,
		@Param("id") id: string,
		@UploadedFile() file: Express.Multer.File,
		@Body() updateVenueDto: UpdateVenueDto,
	) {
		const baseUrl = getBaseUrl(req);
		console.log(baseUrl);

		return this.venuesService.updateOneById(
			baseUrl,
			staff,
			id,
			file,
			updateVenueDto,
		);
	}

	// need to delete image at same time
	@Delete(":id")
	deleteOneById(@Req() req: express.Request, @Param("id") id: string) {
		return this.venuesService.deleteOneById(id);
	}
}
