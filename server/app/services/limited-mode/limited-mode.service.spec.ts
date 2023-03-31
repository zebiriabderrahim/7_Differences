import { Test, TestingModule } from '@nestjs/testing';
import { RoomsManagerService } from '@app/services/rooms-manager/rooms-manager.service';
import { LimitedModeService } from './limited-mode.service';
import { GameService } from '@app/services/game/game.service';
import { createStubInstance, SinonStubbedInstance } from 'sinon';

describe('LimitedModeService', () => {
    let service: LimitedModeService;
    let roomsManagerService: SinonStubbedInstance<RoomsManagerService>;
    let gameService: SinonStubbedInstance<GameService>;

    beforeEach(async () => {
        gameService = createStubInstance(GameService);
        roomsManagerService = createStubInstance(RoomsManagerService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LimitedModeService,
                {
                    provide: GameService,
                    useValue: gameService,
                },
                {
                    provide: RoomsManagerService,
                    useValue: roomsManagerService,
                },
            ],
        }).compile();

        service = module.get<LimitedModeService>(LimitedModeService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
