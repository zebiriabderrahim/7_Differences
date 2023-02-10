import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type GameDocument = Game & Document;

@Schema()
export class Game {
    @ApiProperty()
    @Prop({ required: true })
    name: string;

    @ApiProperty()
    @Prop({ required: true })
    original: string;

    @ApiProperty()
    @Prop({ required: true })
    modified: string;

    @ApiProperty()
    @Prop({ required: true })
    differencesCount: number;

    @ApiProperty()
    @Prop({ required: true })
    differences: string;

    @ApiProperty()
    @Prop({ required: true })
    isHard: boolean;

    @ApiProperty()
    _id?: string;
}

export const gameSchema = SchemaFactory.createForClass(Game);
