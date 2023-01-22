import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema()
export class Course {
    @ApiProperty()
    @Prop({ required: true })
    name: string;

    @ApiProperty()
    @Prop({ required: true })
    teacher: string;

    @ApiProperty()
    @Prop({ required: true })
    subjectCode: string;

    @ApiProperty()
    @Prop({ required: true })
    credits: number;

    @ApiProperty()
    _id?: string;
}

export const courseSchema = SchemaFactory.createForClass(Course);
