import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Req,
} from "@nestjs/common";
import { Public } from "src/authentication/public.decorator";
import { StaffPayload } from "src/utils/types";
import { CreateStaffDto } from "./dto/create-staff.dto";
import { UpdateStaffDto } from "./dto/update-staff.dto";
import { Staff } from "./staff.decorator";
import { StaffService } from "./staff.service";

@Controller("staff")
export class StaffController {
	constructor(private readonly staffService: StaffService) {}

	@Public()
	@Post()
	create(
		@Body() createStaffDto: CreateStaffDto,
		@Staff() staff?: StaffPayload,
	) {
		return this.staffService.create(createStaffDto, staff);
	}

	@Get()
	findAll() {
		return this.staffService.findAll();
	}

	@Public()
	@Get("/setup")
	isSetupDone() {
		return this.staffService.isSetupDone();
	}

	@Get(":id")
	findOneById(@Param("id") id: string) {
		return this.staffService.findOneById(id);
	}

	@Patch(":id")
	updateOneById(
		@Staff() staff: StaffPayload,
		@Param("id") id: string,
		@Body() updateStaffDto: UpdateStaffDto,
	) {
		return this.staffService.updateById(staff, id, updateStaffDto);
	}

	@Delete(":id")
	deleteById(@Param("id") id: string, @Staff() staff: StaffPayload) {
		return this.staffService.deleteById(id, staff);
	}
}
