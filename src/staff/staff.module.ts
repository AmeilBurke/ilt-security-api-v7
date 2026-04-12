import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { StaffController } from "./staff.controller";
import { StaffService } from "./staff.service";

@Module({
	controllers: [StaffController],
	providers: [StaffService, PrismaService],
	exports: [StaffService],
})
export class StaffModule {}
