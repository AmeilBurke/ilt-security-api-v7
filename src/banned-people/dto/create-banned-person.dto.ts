import { BanDuration } from '@prisma/client';
import { IsBoolean, IsBooleanString, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateBannedPersonDto {
  @IsString()
  name: string;

  @IsString()
  createdById: string;

  @IsString()
  // need to be removed when jwt token is implemented
  reason: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsDateString()
  startDate: Date;

  @IsEnum(BanDuration)
  duration: BanDuration;

  @IsBooleanString()
  isBlanketBan?: string;
}
