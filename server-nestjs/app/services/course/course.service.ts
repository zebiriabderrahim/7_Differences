import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';

import { Course, CourseDocument } from '@app/model/database/course';
import { CreateCourseDto } from '@app/model/dto/course/create-course.dto';
import { UpdateCourseDto } from '@app/model/dto/course/update-course.dto';

const MAXIMUM_NUMBER_OF_CREDITS = 6;

@Injectable()
export class CourseService {
    constructor(@InjectModel(Course.name) public courseModel: Model<CourseDocument>, private readonly logger: Logger) {
        this.start();
    }

    async start() {
        if ((await this.courseModel.countDocuments()) === 0) {
            await this.populateDB();
        }
    }

    async populateDB(): Promise<void> {
        const courses: CreateCourseDto[] = [
            {
                name: 'Object Oriented Programming',
                credits: 3,
                subjectCode: 'INF1010',
                teacher: 'Samuel Kadoury',
            },
            {
                name: 'Intro to Software Engineering',
                credits: 3,
                subjectCode: 'LOG1000',
                teacher: 'Bram Adams',
            },
            {
                name: 'Project I',
                credits: 4,
                subjectCode: 'INF1900',
                teacher: 'Jerome Collin',
            },
            {
                name: 'Project II',
                credits: 3,
                subjectCode: 'LOG2990',
                teacher: 'Levis Theriault',
            },
            {
                name: 'Web Semantics and Ontology',
                credits: 2,
                subjectCode: 'INF8410',
                teacher: 'Michel Gagnon',
            },
        ];

        this.logger.log('THIS ADDS DATA TO THE DATABASE, DO NOT USE OTHERWISE');
        await this.courseModel.insertMany(courses);
    }

    async getAllCourses(): Promise<Course[]> {
        return await this.courseModel.find({});
    }

    async getCourse(sbjCode: string): Promise<Course> {
        // NB: This can return null if the course does not exist, you need to handle it
        return await this.courseModel.findOne({ subjectCode: sbjCode });
    }

    async addCourse(course: CreateCourseDto): Promise<void> {
        if (!this.validateCourse(course)) {
            return Promise.reject('Invalid course');
        }
        try {
            await this.courseModel.create(course);
        } catch (error) {
            return Promise.reject(`Failed to insert course: ${error}`);
        }
    }

    async deleteCourse(sbjCode: string): Promise<void> {
        try {
            const res = await this.courseModel.deleteOne({
                subjectCode: sbjCode,
            });
            if (res.deletedCount === 0) {
                return Promise.reject('Could not find course');
            }
        } catch (error) {
            return Promise.reject(`Failed to delete course: ${error}`);
        }
    }

    async modifyCourse(course: UpdateCourseDto): Promise<void> {
        const filterQuery = { subjectCode: course.subjectCode };
        // Can also use replaceOne if we want to replace the entire object
        try {
            const res = await this.courseModel.updateOne(filterQuery, course);
            if (res.matchedCount === 0) {
                return Promise.reject('Could not find course');
            }
        } catch (error) {
            return Promise.reject(`Failed to update document: ${error}`);
        }
    }

    async getCourseTeacher(sbjCode: string): Promise<string> {
        const filterQuery = { subjectCode: sbjCode };
        // Only get the teacher and not any of the other fields
        try {
            const res = await this.courseModel.findOne(filterQuery, {
                teacher: 1,
            });
            return res.teacher;
        } catch (error) {
            return Promise.reject(`Failed to get data: ${error}`);
        }
    }

    async getCoursesByTeacher(name: string): Promise<Course[]> {
        const filterQuery: FilterQuery<Course> = { teacher: name };
        return await this.courseModel.find(filterQuery);
    }

    private validateCourse(course: CreateCourseDto): boolean {
        return this.validateCode(course.subjectCode) && this.validateCredits(course.credits);
    }
    private validateCode(subjectCode: string): boolean {
        return subjectCode.startsWith('LOG') || subjectCode.startsWith('INF');
    }
    private validateCredits(credits: number): boolean {
        return credits > 0 && credits <= MAXIMUM_NUMBER_OF_CREDITS;
    }
}
