import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from './course.service';
import { Model, Connection } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { Course, CourseDocument, courseSchema } from '@app/model/database/course';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';

/**
 * There is two way to test the service :
 * - Mock the mongoose Model implementation and do what ever we want to do with it (see describe CourseService) or
 * - Use mongodb memory server implementation (see describe CourseServiceEndToEnd) and let everything go through as if we had a real database
 *
 * The second method is generally better because it tests the database queries too.
 * We will use it more
 */

describe('CourseService', () => {
    let service: CourseService;
    let courseModel: Model<CourseDocument>;

    beforeEach(async () => {
        // notice that only the functions we call from the model are mocked
        // we can´t use sinon because mongoose Model is an interface
        courseModel = {
            countDocuments: jest.fn(),
            insertMany: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            deleteOne: jest.fn(),
            update: jest.fn(),
            updateOne: jest.fn(),
        } as unknown as Model<CourseDocument>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CourseService,
                Logger,
                {
                    provide: getModelToken(Course.name),
                    useValue: courseModel,
                },
            ],
        }).compile();

        service = module.get<CourseService>(CourseService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('database should be populated when there is no data', async () => {
        jest.spyOn(courseModel, 'countDocuments').mockResolvedValue(0);
        const spyPopulateDB = jest.spyOn(service, 'populateDB');
        await service.start();
        expect(spyPopulateDB).toHaveBeenCalled();
    });

    it('database should not be populated when there is some data', async () => {
        jest.spyOn(courseModel, 'countDocuments').mockResolvedValue(1);
        const spyPopulateDB = jest.spyOn(service, 'populateDB');
        await service.start();
        expect(spyPopulateDB).not.toHaveBeenCalled();
    });
});

const DELAY_BEFORE_CLOSING_CONNECTION = 200;

describe('CourseServiceEndToEnd', () => {
    let service: CourseService;
    let courseModel: Model<CourseDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        // notice that only the functions we call from the model are mocked
        // we can´t use sinon because mongoose Model is an interface
        const module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: Course.name, schema: courseSchema }]),
            ],
            providers: [CourseService, Logger],
        }).compile();

        service = module.get<CourseService>(CourseService);
        courseModel = module.get<Model<CourseDocument>>(getModelToken(Course.name));
        connection = await module.get(getConnectionToken());
    });

    afterEach((done) => {
        // The database get auto populated in the constructor
        // We want to make sur we close the connection after the database got
        // populated. So we add small delay
        setTimeout(async () => {
            await connection.close();
            await mongoServer.stop();
            done();
        }, DELAY_BEFORE_CLOSING_CONNECTION);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(courseModel).toBeDefined();
    });

    it('start() should populate the database when there is no data', async () => {
        const spyPopulateDB = jest.spyOn(service, 'populateDB');
        await courseModel.deleteMany({});
        await service.start();
        expect(spyPopulateDB).toHaveBeenCalled();
    });

    it('start() should not populate the DB when there is some data', async () => {
        const course = getFakeCourse();
        await courseModel.create(course);
        const spyPopulateDB = jest.spyOn(service, 'populateDB');
        expect(spyPopulateDB).not.toHaveBeenCalled();
    });

    it('populateDB() should add 5 new courses', async () => {
        const eltCountsBefore = await courseModel.countDocuments();
        await service.populateDB();
        const eltCountsAfter = await courseModel.countDocuments();
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(eltCountsAfter - eltCountsBefore).toEqual(5);
    });

    it('getAllCourses() return all courses in database', async () => {
        await courseModel.deleteMany({});
        expect((await service.getAllCourses()).length).toEqual(0);
        const course = getFakeCourse();
        await courseModel.create(course);
        expect((await service.getAllCourses()).length).toEqual(1);
    });

    it('getCourse() return course with the specified subject code', async () => {
        const course = getFakeCourse();
        await courseModel.create(course);
        expect(await service.getCourse(course.subjectCode)).toEqual(expect.objectContaining(course));
    });

    it('getCourseTeacher() should return course teacher', async () => {
        const course = getFakeCourse();
        await courseModel.create(course);
        const teacher = await service.getCourseTeacher(course.subjectCode);
        expect(teacher).toEqual(course.teacher);
    });

    it('getCourseTeacher() should fail if course does not exist', async () => {
        const course = getFakeCourse();
        await expect(service.getCourseTeacher(course.teacher)).rejects.toBeTruthy();
    });

    it('modifyCourse() should fail if course does not exist', async () => {
        const course = getFakeCourse();
        await expect(service.modifyCourse(course)).rejects.toBeTruthy();
    });

    it('modifyCourse() should fail if mongo query failed', async () => {
        jest.spyOn(courseModel, 'updateOne').mockRejectedValue('');
        const course = getFakeCourse();
        await expect(service.modifyCourse(course)).rejects.toBeTruthy();
    });

    it('getCoursesByTeacher() return course with the specified teacher', async () => {
        const course = getFakeCourse();
        await courseModel.create(course);
        await courseModel.create(course);
        const courses = await service.getCoursesByTeacher(course.teacher);
        expect(courses.length).toEqual(2);
        expect(courses[0]).toEqual(expect.objectContaining(course));
    });

    it('deleteCourse() should delete the course', async () => {
        await courseModel.deleteMany({});
        const course = getFakeCourse();
        await courseModel.create(course);
        await service.deleteCourse(course.subjectCode);
        expect(await courseModel.countDocuments()).toEqual(0);
    });

    it('deleteCourse() should fail if the course does not exist', async () => {
        await courseModel.deleteMany({});
        const course = getFakeCourse();
        await expect(service.deleteCourse(course.subjectCode)).rejects.toBeTruthy();
    });

    it('deleteCourse() should fail if mongo query failed', async () => {
        jest.spyOn(courseModel, 'deleteOne').mockRejectedValue('');
        const course = getFakeCourse();
        await expect(service.deleteCourse(course.subjectCode)).rejects.toBeTruthy();
    });

    it('addCourse() should add the course to the DB', async () => {
        await courseModel.deleteMany({});
        const course = getFakeCourse();
        await service.addCourse({ ...course, subjectCode: 'INF', credits: 5 });
        expect(await courseModel.countDocuments()).toEqual(1);
    });

    it('addCourse() should fail if mongo query failed', async () => {
        jest.spyOn(courseModel, 'create').mockImplementation(async () => Promise.reject(''));
        const course = getFakeCourse();
        await expect(service.addCourse({ ...course, subjectCode: 'INF', credits: 5 })).rejects.toBeTruthy();
    });

    it('addCourse() should fail if the course is not a valid', async () => {
        const course = getFakeCourse();
        await expect(service.addCourse({ ...course, subjectCode: 'IND', credits: 5 })).rejects.toBeTruthy();
        await expect(service.addCourse({ ...course, subjectCode: 'INF', credits: 90 })).rejects.toBeTruthy();
        await expect(service.addCourse({ ...course, subjectCode: 'IND', credits: 90 })).rejects.toBeTruthy();
    });
});

const getFakeCourse = (): Course => ({
    name: getRandomString(),
    credits: 3,
    subjectCode: getRandomString(),
    teacher: getRandomString(),
});

const BASE_36 = 36;
const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
