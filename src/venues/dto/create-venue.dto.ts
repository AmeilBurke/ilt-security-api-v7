import { IsArray, IsOptional, IsPhoneNumber, IsString, IsUUID } from "class-validator"

export class CreateVenueDto {
    @IsString()
    name: string

    @IsString()
    address: string

    @IsPhoneNumber('NZ')
    phone: string

    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    venueManagers?: string[];

    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    dutyManagers?: string[];
}
