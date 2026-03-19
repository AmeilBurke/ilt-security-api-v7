import { IsString, IsPhoneNumber, IsOptional, IsArray, IsUUID } from 'class-validator';

export class UpdateVenueDto {
    @IsOptional()
    @IsString()
    name?: string

    @IsOptional()
    @IsString()
    address?: string

    @IsOptional()
    @IsPhoneNumber('NZ')
    phone?: string

    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    venueManagers?: string[];

    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    dutyManagers?: string[];
}
