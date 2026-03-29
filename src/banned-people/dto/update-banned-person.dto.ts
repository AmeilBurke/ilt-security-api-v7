import { BanDuration } from '@prisma/client';
import { IsString, IsOptional, IsDateString, IsEnum, IsBooleanString } from 'class-validator';

export class UpdateBannedPersonDto {
    @IsOptional()
    @IsString()
    name?: string;
}
