import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '@app/services/database/database.service';
import { GameService } from './game.service';

describe('GameService', () => {
    let service: GameService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameService, { provide: DatabaseService, useValue: {} }],
        }).compile();

        service = module.get<GameService>(GameService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
