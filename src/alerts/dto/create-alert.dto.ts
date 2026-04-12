import { IsOptional, IsString } from "class-validator"

export class CreateAlertDto {
    @IsOptional()
    @IsString()
    personId?: string

    @IsString()
    reason!: string

    @IsOptional()
    @IsString()
    imagePath?: string
}
