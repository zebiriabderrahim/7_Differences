import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from '@app/services/course/course.service';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { CourseController } from './course.controller';
import { Course } from '@app/model/database/course';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

describe('CourseController', () => {
    let controller: CourseController;
    let courseService: SinonStubbedInstance<CourseService>;

    beforeEach(async () => {
        courseService = createStubInstance(CourseService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CourseController],
            providers: [
                {
                    provide: CourseService,
                    useValue: courseService,
                },
            ],
        }).compile();

        controller = module.get<CourseController>(CourseController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('allCourses() should return all courses', async () => {
        const fakeCourses = [new Course(), new Course()];
        courseService.getAllCourses.resolves(fakeCourses);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (courses) => {
            expect(courses).toEqual(fakeCourses);
            return res;
        };

        await controller.allCourses(res);
    });

    it('allCourses() should return NOT_FOUND when service unable to fetch courses', async () => {
        courseService.getAllCourses.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.allCourses(res);
    });

    it('subjectCode() should return the subject code', async () => {
        const fakeCourse = new Course();
        courseService.getCourse.resolves(fakeCourse);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (courses) => {
            expect(courses).toEqual(fakeCourse);
            return res;
        };

        await controller.subjectCode('', res);
    });

    it('subjectCode() should return NOT_FOUND when service unable to fetch the course', async () => {
        courseService.getCourse.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.subjectCode('', res);
    });

    it('addCourse() should succeed if service able to add the course', async () => {
        courseService.addCourse.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CREATED);
            return res;
        };
        res.send = () => res;

        await controller.addCourse(new Course(), res);
    });

    it('addCourse() should return NOT_FOUND when service add the course', async () => {
        courseService.addCourse.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.addCourse(new Course(), res);
    });

    it('modifyCourse() should succeed if service able to modify the course', async () => {
        courseService.modifyCourse.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;

        await controller.modifyCourse(new Course(), res);
    });

    it('modifyCourse() should return NOT_FOUND when service cannot modify the course', async () => {
        courseService.modifyCourse.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.modifyCourse(new Course(), res);
    });

    it('deleteCourse() should succeed if service able to delete the course', async () => {
        courseService.deleteCourse.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;

        await controller.deleteCourse('', res);
    });

    it('deleteCourse() should return NOT_FOUND when service cannot delete the course', async () => {
        courseService.deleteCourse.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.deleteCourse('', res);
    });

    it('getCourseTeacher() should return the course teacher', async () => {
        const teacher = 'teacher x';
        courseService.getCourseTeacher.resolves(teacher);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (courses) => {
            expect(courses).toEqual(teacher);
            return res;
        };

        await controller.getCourseTeacher('', res);
    });

    it('getCourseTeacher() should return NOT_FOUND when service unable to fetch the course teacher', async () => {
        courseService.getCourseTeacher.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.getCourseTeacher('', res);
    });

    it('getCoursesByTeacher() should return all teacher courses', async () => {
        const fakeCourses = [new Course(), new Course()];
        courseService.getCoursesByTeacher.resolves(fakeCourses);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (courses) => {
            expect(courses).toEqual(fakeCourses);
            return res;
        };

        await controller.getCoursesByTeacher('', res);
    });

    it('getCoursesByTeacher() should return NOT_FOUND when service unable to fetch teacher courses', async () => {
        courseService.getCoursesByTeacher.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.getCoursesByTeacher('', res);
    });
});
