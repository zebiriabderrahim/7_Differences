import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from '@app/services/game/game.service';
import { RoomsManagerService } from './rooms-manager.service';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { MessageManagerService } from '@app/services/message-manager/message-manager.service';

describe('RoomsManagerService', () => {
    let service: RoomsManagerService;
    let gameService: SinonStubbedInstance<GameService>;
    let messageManager: SinonStubbedInstance<MessageManagerService>;

    beforeEach(async () => {
        gameService = createStubInstance(GameService);
        messageManager = createStubInstance(MessageManagerService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RoomsManagerService,
                {
                    provide: MessageManagerService,
                    useValue: messageManager,
                },
                {
                    provide: GameService,
                    useValue: gameService,
                },
            ],
        }).compile();

        service = module.get<RoomsManagerService>(RoomsManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
