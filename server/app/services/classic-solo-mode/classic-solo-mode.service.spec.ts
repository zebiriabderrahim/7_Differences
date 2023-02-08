import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from '@app/services/game/game.service';
import { ClassicSoloModeService } from './classic-solo-mode.service';
import { createStubInstance, SinonStubbedInstance } from 'sinon';

describe('ClassicSoloModeService', () => {
    let service: ClassicSoloModeService;
    let gameService: SinonStubbedInstance<GameService>;

    beforeEach(async () => {
        gameService = createStubInstance(GameService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClassicSoloModeService,
                {
                    provide: GameService,
                    useValue: gameService,
                },
            ],
        }).compile();

        service = module.get<ClassicSoloModeService>(ClassicSoloModeService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
