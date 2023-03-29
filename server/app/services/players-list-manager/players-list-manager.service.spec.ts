import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { GameService } from '@app/services/game/game.service';
import { PlayersListManagerService } from './players-list-manager.service';

describe('PlayersListManagerService', () => {
    let service: PlayersListManagerService;
    let gameService: SinonStubbedInstance<GameService>;

    beforeEach(async () => {
        gameService = createStubInstance(GameService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlayersListManagerService,
                {
                    provide: GameService,
                    useValue: gameService,
                },
            ],
        }).compile();

        service = module.get<PlayersListManagerService>(PlayersListManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
