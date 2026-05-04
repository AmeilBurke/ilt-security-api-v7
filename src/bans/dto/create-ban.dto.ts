import { Transform } from "class-transformer";
import { IsArray, IsBoolean, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateBanDto {

    @IsString()
    personId!: string;

    @IsString()
    reason!: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsString()
    startDate!: string;

    @IsString()
    endDate!: string;

    @IsBoolean()
    isBlanketBan!: boolean;

    @IsArray()
    @IsUUID('4', { each: true })
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    venueIds!: string[]
}
