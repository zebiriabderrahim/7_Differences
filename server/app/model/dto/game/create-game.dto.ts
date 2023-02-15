import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Coordinate } from '@common/coordinate';

export class CreateGameDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    originalImage: string;

    @ApiProperty()
    @IsString()
    modifiedImage: string;

    @ApiProperty()
    @IsNumber()
    nDifference: number;

    @ApiProperty()
    @IsOptional()
    differences: Coordinate[][];

    @ApiProperty()
    @IsBoolean()
    isHard: boolean;
}
