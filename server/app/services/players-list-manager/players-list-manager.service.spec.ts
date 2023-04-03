import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { GameService } from '@app/services/game/game.service';
import { PlayersListManagerService } from './players-list-manager.service';
import { MessageManagerService } from '@app/services/message-manager/message-manager.service';

describe('PlayersListManagerService', () => {
    let service: PlayersListManagerService;
    let gameService: SinonStubbedInstance<GameService>;
    let messageManagerService: SinonStubbedInstance<MessageManagerService>;

    beforeEach(async () => {
        gameService = createStubInstance(GameService);
        messageManagerService = createStubInstance(MessageManagerService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlayersListManagerService,
                {
                    provide: GameService,
                    useValue: gameService,
                },
                {
                    provide: MessageManagerService,
                    useValue: messageManagerService,
                },
            ],
        }).compile();

        service = module.get<PlayersListManagerService>(PlayersListManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
