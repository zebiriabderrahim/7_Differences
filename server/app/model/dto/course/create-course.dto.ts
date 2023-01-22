import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, MaxLength } from 'class-validator';
import { COURSE_NAME_MAX_LENGTH } from '@app/model/dto/course/course.dto.constants';

export class CreateCourseDto {
    @ApiProperty({ maxLength: COURSE_NAME_MAX_LENGTH })
    @IsString()
    @MaxLength(COURSE_NAME_MAX_LENGTH)
    name: string;

    @ApiProperty()
    @IsString()
    teacher: string;

    @ApiProperty()
    @IsString()
    subjectCode: string;

    @ApiProperty()
    @IsNumber()
    credits: number;
}
