import { Course } from '@app/model/database/course';
import { CreateCourseDto } from '@app/model/dto/course/create-course.dto';
import { UpdateCourseDto } from '@app/model/dto/course/update-course.dto';
import { CourseService } from '@app/services/course/course.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Res } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Courses')
@Controller('course')
export class CourseController {
    constructor(private readonly coursesService: CourseService) {}

    @ApiOkResponse({
        description: 'Returns all courses',
        type: Course,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/')
    async allCourses(@Res() response: Response) {
        try {
            const allCourses = await this.coursesService.getAllCourses();
            response.status(HttpStatus.OK).json(allCourses);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Get course by subject code',
        type: Course,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/:subjectCode')
    async subjectCode(@Param('subjectCode') subjectCode: string, @Res() response: Response) {
        try {
            const course = await this.coursesService.getCourse(subjectCode);
            response.status(HttpStatus.OK).json(course);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiCreatedResponse({
        description: 'Add new course',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Post('/')
    async addCourse(@Body() courseDto: CreateCourseDto, @Res() response: Response) {
        try {
            await this.coursesService.addCourse(courseDto);
            response.status(HttpStatus.CREATED).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Modify a course',
        type: Course,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Patch('/')
    async modifyCourse(@Body() courseDto: UpdateCourseDto, @Res() response: Response) {
        try {
            await this.coursesService.modifyCourse(courseDto);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Delete a course',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Delete('/:subjectCode')
    async deleteCourse(@Param('subjectCode') subjectCode: string, @Res() response: Response) {
        try {
            await this.coursesService.deleteCourse(subjectCode);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Get a specific course teacher',
        type: String,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/teachers/code/:subjectCode')
    async getCourseTeacher(@Param('subjectCode') subjectCode: string, @Res() response: Response) {
        try {
            const teacher = await this.coursesService.getCourseTeacher(subjectCode);
            response.status(HttpStatus.OK).json(teacher);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Get specific teacher courses',
        type: Course,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/teachers/name/:name')
    async getCoursesByTeacher(@Param('name') name: string, @Res() response: Response) {
        try {
            const courses = await this.coursesService.getCoursesByTeacher(name);
            response.status(HttpStatus.OK).json(courses);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }
}
