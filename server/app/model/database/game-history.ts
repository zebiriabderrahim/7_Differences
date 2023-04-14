import { PlayerInfo } from '@common/game-interfaces';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type GameHistoryDocument = GameHistory & Document;

@Schema()
export class GameHistory {
    @ApiProperty()
    @Prop({ required: true })
    gameMode: string;

    @ApiProperty()
    @Prop({ required: false, type: () => ({ name: String, isWinner: Boolean, isQuitter: Boolean }) })
    player2?: PlayerInfo;

    @ApiProperty()
    @Prop({ required: true, type: () => ({ name: String, isWinner: Boolean, isQuitter: Boolean }) })
    player1: PlayerInfo;

    @ApiProperty()
    @Prop({ required: true })
    duration: number;

    @ApiProperty()
    @Prop({ required: true })
    startingHour: string;

    @ApiProperty()
    @Prop({ required: true })
    date: string;
}

export const gameHistorySchema = SchemaFactory.createForClass(GameHistory);
