import { IsString, IsOptional } from 'class-validator';

export class UpdateBannedPersonDto {
    @IsOptional()
    @IsString()
    name?: string;
}
