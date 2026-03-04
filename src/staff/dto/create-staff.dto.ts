import { Role } from '@prisma/client';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateStaffDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  venueManagerAssignments?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  dutyManagerAssignments?: string[];
}
