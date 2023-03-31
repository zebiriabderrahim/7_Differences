import { Test, TestingModule } from '@nestjs/testing';
import { RoomsManagerService } from './rooms-manager.service';

describe('RoomsManagerService', () => {
    let service: RoomsManagerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [RoomsManagerService],
        }).compile();

        service = module.get<RoomsManagerService>(RoomsManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
