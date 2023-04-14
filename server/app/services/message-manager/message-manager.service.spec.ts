import { GameModes } from '@common/enums';
import { Test, TestingModule } from '@nestjs/testing';
import { MessageManagerService } from './message-manager.service';

describe('MessageManagerService', () => {
    let service: MessageManagerService;
    const playerNameStub = 'playerName';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MessageManagerService],
        }).compile();

        service = module.get<MessageManagerService>(MessageManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getQuitMessage() should return a message that a player quit the game', () => {
        const getQuitMessageSpy = jest.spyOn(service, 'getQuitMessage');
        service.getQuitMessage(playerNameStub);

        expect(getQuitMessageSpy).toHaveBeenCalledWith(playerNameStub);
    });

    it('getLocalMessage() should return the correct message depending on the game mode solo and if the difference is found ', () => {
        const getLocalMessageSpy = jest.spyOn(service, 'getLocalMessage');

        const isFoundStub = true;
        service.getLocalMessage(GameModes.ClassicSolo, isFoundStub, playerNameStub);

        expect(getLocalMessageSpy).toHaveBeenCalled();
    });

    it('getLocalMessage() should return the correct message depending on the game mode oneVsOne and if the difference is found ', () => {
        const getLocalMessageSpy = jest.spyOn(service, 'getLocalMessage');

        const isFoundStub = true;
        service.getLocalMessage(GameModes.ClassicOneVsOne, isFoundStub, playerNameStub);

        expect(getLocalMessageSpy).toHaveBeenCalled();
    });

    it('getLocalMessage() should return the correct message depending on the game mode solo and if the difference is not found ', () => {
        const getLocalMessageSpy = jest.spyOn(service, 'getLocalMessage');

        const isFoundStub = false;
        service.getLocalMessage(GameModes.ClassicSolo, isFoundStub, playerNameStub);

        expect(getLocalMessageSpy).toHaveBeenCalled();
    });

    it('getLocalMessage() should return the correct message depending on the game mode oneVsOne and if the difference is not found ', () => {
        const getLocalMessageSpy = jest.spyOn(service, 'getLocalMessage');

        const isFoundStub = false;
        service.getLocalMessage(GameModes.ClassicOneVsOne, isFoundStub, playerNameStub);

        expect(getLocalMessageSpy).toHaveBeenCalled();
    });

    it('getNewRecordMessage() should return the correct message depending on the game mode oneVsOne and if the difference is not found ', () => {
        const getNewRecordMessageSpy = jest.spyOn(service, 'getNewRecordMessage');
        const newRecordStub = {
            playerName: 'playerName',
            rank: 1,
            gameName: 'gameName',
            gameMode: GameModes.ClassicOneVsOne,
        };
        service.getNewRecordMessage(newRecordStub);

        expect(getNewRecordMessageSpy).toHaveBeenCalled();
    });
});
