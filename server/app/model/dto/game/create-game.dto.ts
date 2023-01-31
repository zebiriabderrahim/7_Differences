import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateGameDto {
    @ApiProperty()
    @IsNumber()
    id: number;

    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    originalImagePath: string;

    @ApiProperty()
    @IsString()
    modifiedImagePath: string;

    @ApiProperty()
    @IsNumber()
    nDifference: number;

    @ApiProperty()
    @IsOptional()
    differenceMatrix: number[][];

    @ApiProperty()
    @IsBoolean()
    isHard: boolean;
}
