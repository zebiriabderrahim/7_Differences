import { Test, TestingModule } from '@nestjs/testing';
import { DateController } from '@app/controllers/date/date.controller';
import { DateService } from '@app/services/date/date.service';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Message } from '@common/message';

describe('DateController', () => {
    let controller: DateController;
    let dateService: SinonStubbedInstance<DateService>;

    beforeEach(async () => {
        dateService = createStubInstance(DateService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [DateController],
            providers: [
                {
                    provide: DateService,
                    useValue: dateService,
                },
            ],
        }).compile();

        controller = module.get<DateController>(DateController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('allCourses() should return all courses', async () => {
        const fakeDateInfo: Message = {
            title: 'Time',
            body: new Date().toString(),
        };
        dateService.currentTime.returns(fakeDateInfo.body);

        const dateInfo = controller.dateInfo();
        expect(dateService.currentTime.calledOnce).toBe(true);
        expect(dateInfo).toEqual(fakeDateInfo);
    });
});
