import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type GameConstantsDocument = GameConstants & Document;

@Schema()
export class GameConstants {
    @ApiProperty()
    @Prop({ required: true })
    countdownTime: number;

    @ApiProperty()
    @Prop({ required: true })
    penaltyTime: number;

    @ApiProperty()
    @Prop({ required: true })
    bonusTime: number;
}

export const gameConstantsSchema = SchemaFactory.createForClass(GameConstants);
