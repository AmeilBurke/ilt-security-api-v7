import { Transform } from 'class-transformer';
import { IsArray, IsBooleanString, IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBannedPersonDto {
  @IsString()
  name!: string;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsDateString()
  startDate!: Date;

  @IsDateString()
  endDate!: Date;

  @IsBooleanString()
  isBlanketBan!: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  venueIds!: string[]
}
