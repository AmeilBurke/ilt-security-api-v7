import { BanDuration } from "@/generated/prisma/enums";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class CreateBanDto {
    @IsString()
    personId!: string;

    @IsString()
    createdById!: string;

    @IsString()
    reason!: string;

    @IsOptional()
    @IsString()
    notes: string | undefined;

    @IsEnum(BanDuration)
    duration!: BanDuration;
}
