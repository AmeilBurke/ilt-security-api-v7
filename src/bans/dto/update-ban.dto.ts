
import { BanStatus } from "@/generated/prisma/client";
import { Transform } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from "class-validator";

export class UpdateBanDto {
    @IsOptional()
    @IsString()
    personId?: string;

    @IsOptional()
    @IsString()
    reason?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsString()
    startDate?: string;

    @IsOptional()
    @IsString()
    endDate?: string;

    @IsOptional()
    @IsBoolean()
    isBlanketBan?: boolean;

    @IsOptional()
    @IsEnum(BanStatus)
    status?: BanStatus

    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    venueIds?: string[]
}