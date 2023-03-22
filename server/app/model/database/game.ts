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
    originalImage: string;

    @ApiProperty()
    @Prop({ required: true })
    modifiedImage: string;

    @ApiProperty()
    @Prop({ required: true })
    nDifference: number;

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
