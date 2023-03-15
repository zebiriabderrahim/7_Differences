import { Test, TestingModule } from '@nestjs/testing';
import { MessageManagerService } from './message-manager.service';

describe('MessageManagerService', () => {
    let service: MessageManagerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MessageManagerService],
        }).compile();

        service = module.get<MessageManagerService>(MessageManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
