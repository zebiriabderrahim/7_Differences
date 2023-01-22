import { Test, TestingModule } from '@nestjs/testing';
import { ExampleController } from '@app/controllers/example/example.controller';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { ExampleService } from '@app/services/example/example.service';

describe.only('ExampleController', () => {
    let controller: ExampleController;
    let exampleService: SinonStubbedInstance<ExampleService>;

    beforeEach(async () => {
        exampleService = createStubInstance(ExampleService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ExampleController],
            providers: [
                {
                    provide: ExampleService,
                    useValue: exampleService,
                },
            ],
        }).compile();

        controller = module.get<ExampleController>(ExampleController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('exampleInfo() should call ExampleService.helloWord()', () => {
        const fakeMessage = getFakeMessage();
        exampleService.helloWorld.returns(fakeMessage);
        const message = controller.exampleInfo();
        expect(message).toEqual(fakeMessage);
        expect(exampleService.helloWorld.calledOnce).toBeTruthy();
    });

    it('about() should call ExampleService.about()', () => {
        const fakeMessage = getFakeMessage();
        exampleService.about.returns(fakeMessage);
        const message = controller.about();
        expect(exampleService.about.calledOnce).toBeTruthy();
        expect(message).toBe(fakeMessage);
    });

    it('all() should call ExampleService.all()', () => {
        const fakeMessages = [getFakeMessage()];
        exampleService.getAllMessages.returns(fakeMessages);
        const messages = controller.all();
        expect(exampleService.getAllMessages.calledOnce).toBeTruthy();
        expect(messages).toBe(fakeMessages);
    });

    it('send() should store message in ExampleService', () => {
        const message = getFakeMessage();
        controller.send(message);
        expect(exampleService.storeMessage.calledOnce).toBeTruthy();
        expect(exampleService.storeMessage.calledWith(message)).toBeTruthy();
    });
});

const getFakeMessage = () => ({
    title: 'X',
    body: 'Y',
});
