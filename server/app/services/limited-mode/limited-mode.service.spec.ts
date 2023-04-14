import { GameService } from '@app/services/game/game.service';
import { HistoryService } from '@app/services/history/history.service';
import { RoomsManagerService } from '@app/services/rooms-manager/rooms-manager.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { LimitedModeService } from './limited-mode.service';

describe('LimitedModeService', () => {
    let service: LimitedModeService;
    let roomsManagerService: SinonStubbedInstance<RoomsManagerService>;
    let gameService: SinonStubbedInstance<GameService>;
    let historyService: SinonStubbedInstance<HistoryService>;

    beforeEach(async () => {
        gameService = createStubInstance(GameService);
        roomsManagerService = createStubInstance(RoomsManagerService);
        historyService = createStubInstance(HistoryService);

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
                {
                    provide: HistoryService,
                    useValue: historyService,
                },
            ],
        }).compile();

        service = module.get<LimitedModeService>(LimitedModeService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
