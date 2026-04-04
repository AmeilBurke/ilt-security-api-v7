import { IsBoolean, IsBooleanString, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { BanDuration } from 'src/generated/prisma/client';

export class CreateBannedPersonDto {
  @IsString()
  name: string;

  // @IsString()
  // createdById: string;

  @IsString()
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
