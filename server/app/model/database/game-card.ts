import { PlayerTime } from '@common/game-interfaces';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type GameCardDocument = GameCard & Document;

@Schema()
export class GameCard {
    @ApiProperty()
    @Prop({ required: true })
    name: string;

    @ApiProperty()
    @Prop({ required: true })
    thumbnail: string;

    @ApiProperty()
    @Prop({ required: true })
    oneVsOneTopTime: PlayerTime[];

    @ApiProperty()
    @Prop({ required: true })
    soloTopTime: PlayerTime[];

    @ApiProperty()
    @Prop({ required: true })
    difficultyLevel: boolean;

    @ApiProperty()
    _id: string;
}

export const gameCardSchema = SchemaFactory.createForClass(GameCard);
