import { Test, TestingModule } from '@nestjs/testing';
import { PlayersListManagerService } from './players-list-manager.service';

describe('PlayersListManagerService', () => {
    let service: PlayersListManagerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PlayersListManagerService],
        }).compile();

        service = module.get<PlayersListManagerService>(PlayersListManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
