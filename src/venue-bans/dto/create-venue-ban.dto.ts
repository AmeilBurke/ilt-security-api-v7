import { IsString } from "class-validator"
import { ValidateNested } from "class-validator"
import { Type } from "class-transformer"

export class VenueDetailsDto {
    @IsString()
    venueId!: string

    @IsString()
    endDate!: string
}

export class CreateVenueBanDto {
    @IsString()
    banId!: string

    @ValidateNested({ each: true })
    @Type(() => VenueDetailsDto)
    venueDetails!: VenueDetailsDto[]
}