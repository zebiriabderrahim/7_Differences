import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { COURSE_NAME_MAX_LENGTH } from './course.dto.constants';

export class UpdateCourseDto {
    @ApiProperty({ maxLength: COURSE_NAME_MAX_LENGTH, required: false })
    @IsOptional()
    @IsString()
    @MaxLength(COURSE_NAME_MAX_LENGTH)
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    teacher?: string;

    @ApiProperty()
    @IsString()
    subjectCode: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    credits?: number;
}
