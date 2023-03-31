import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class GameConstantsDto {
    @ApiProperty()
    @IsNumber()
    countdownTime: number;

    @ApiProperty()
    @IsNumber()
    penaltyTime: number;

    @ApiProperty()
    @IsNumber()
    bonusTime: number;
}
