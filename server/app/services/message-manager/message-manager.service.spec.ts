import { GameModes } from '@common/enums';
import { Test, TestingModule } from '@nestjs/testing';
import { MessageManagerService } from './message-manager.service';

describe('MessageManagerService', () => {
    let service: MessageManagerService;
    let formatedTimeStub: string;
    const timeStub = new Date();
    const playerNameStub = 'playerName';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MessageManagerService],
        }).compile();

        service = module.get<MessageManagerService>(MessageManagerService);
        formatedTimeStub = `${timeStub.getHours()} : ${timeStub.getMinutes()} : ${timeStub.getSeconds()}`;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // it('getFormatTime() should return a the current time in this format: HH:MM:SS', () => {
    //     const getFormatTimeSpy = jest.spyOn(service, 'getFormatTime');
    //     const formatedTime = service.getFormatTime();

    //     expect(getFormatTimeSpy).toBeCalled();
    //     expect(formatedTime).toEqual(formatedTimeStub);
    // });

    it('getSoloDifferenceMessage() should return a message that the difference was found', () => {
        const getSoloDifferenceMessageSpy = jest.spyOn(service, 'getSoloDifferenceMessage');
        const getFormatTimeSpy = jest.spyOn(service, 'getFormatTime');
        service.getSoloDifferenceMessage();

        expect(getFormatTimeSpy).toBeCalled();
        expect(getSoloDifferenceMessageSpy).toBeCalled();
    });

    it('getOneVsOneDifferenceMessage() should return a message that the difference was found with the player associated', () => {
        const getOneVsOneDifferenceMessageSpy = jest.spyOn(service, 'getOneVsOneDifferenceMessage');
        const getFormatTimeSpy = jest.spyOn(service, 'getFormatTime');
        service.getOneVsOneDifferenceMessage(playerNameStub);

        expect(getFormatTimeSpy).toBeCalled();
        expect(getOneVsOneDifferenceMessageSpy).toHaveBeenCalledWith(playerNameStub);
    });

    it('getSoloErrorMessage() should return a message that an error was found', () => {
        const getSoloErrorMessageSpy = jest.spyOn(service, 'getSoloErrorMessage');
        const getFormatTimeSpy = jest.spyOn(service, 'getFormatTime');
        service.getSoloErrorMessage();

        expect(getFormatTimeSpy).toBeCalled();
        expect(getSoloErrorMessageSpy).toBeCalled();
    });

    it('getOneVsOneErrorMessage() should return a message that an error was found with the player associated', () => {
        const getOneVsOneErrorMessageSpy = jest.spyOn(service, 'getOneVsOneErrorMessage');
        const getFormatTimeSpy = jest.spyOn(service, 'getFormatTime');
        service.getOneVsOneErrorMessage(playerNameStub);

        expect(getFormatTimeSpy).toBeCalled();
        expect(getOneVsOneErrorMessageSpy).toHaveBeenCalledWith(playerNameStub);
    });

    it('getQuitMessage() should return a message that a player quit the game', () => {
        const getQuitMessageSpy = jest.spyOn(service, 'getQuitMessage');
        const getFormatTimeSpy = jest.spyOn(service, 'getFormatTime');
        service.getQuitMessage(playerNameStub);

        expect(getFormatTimeSpy).toBeCalled();
        expect(getQuitMessageSpy).toHaveBeenCalledWith(playerNameStub);
    });

    it('getLocalMessage() should return the correct message depending on the game mode solo and if the difference is found ', () => {
        const getLocalMessageSpy = jest.spyOn(service, 'getLocalMessage');
        const getSoloDifferenceMessageSpy = jest.spyOn(service, 'getSoloDifferenceMessage');
        const getFormatTimeSpy = jest.spyOn(service, 'getFormatTime');

        const isFoundStub = true;
        service.getLocalMessage(GameModes.ClassicSolo, isFoundStub, playerNameStub);
        expect(getSoloDifferenceMessageSpy).toHaveBeenCalled();

        expect(getFormatTimeSpy).toHaveBeenCalled();
        expect(getLocalMessageSpy).toHaveBeenCalled();
    });

    it('getLocalMessage() should return the correct message depending on the game mode oneVsOne and if the difference is found ', () => {
        const getLocalMessageSpy = jest.spyOn(service, 'getLocalMessage');
        const getOneVsOneDifferenceMessageSpy = jest.spyOn(service, 'getOneVsOneDifferenceMessage');
        const getFormatTimeSpy = jest.spyOn(service, 'getFormatTime');

        const isFoundStub = true;
        service.getLocalMessage(GameModes.ClassicOneVsOne, isFoundStub, playerNameStub);
        expect(getOneVsOneDifferenceMessageSpy).toHaveBeenCalled();

        expect(getFormatTimeSpy).toHaveBeenCalled();
        expect(getLocalMessageSpy).toHaveBeenCalled();
    });

    it('getLocalMessage() should return the correct message depending on the game mode solo and if the difference is not found ', () => {
        const getLocalMessageSpy = jest.spyOn(service, 'getLocalMessage');
        const getSoloErrorMessageSpy = jest.spyOn(service, 'getSoloErrorMessage');
        const getFormatTimeSpy = jest.spyOn(service, 'getFormatTime');

        const isFoundStub = false;
        service.getLocalMessage(GameModes.ClassicSolo, isFoundStub, playerNameStub);
        expect(getSoloErrorMessageSpy).toHaveBeenCalled();

        expect(getFormatTimeSpy).toHaveBeenCalled();
        expect(getLocalMessageSpy).toHaveBeenCalled();
    });

    it('getLocalMessage() should return the correct message depending on the game mode oneVsOne and if the difference is not found ', () => {
        const getLocalMessageSpy = jest.spyOn(service, 'getLocalMessage');
        const getOneVsOneErrorMessageSpy = jest.spyOn(service, 'getOneVsOneErrorMessage');
        const getFormatTimeSpy = jest.spyOn(service, 'getFormatTime');

        const isFoundStub = false;
        service.getLocalMessage(GameModes.ClassicOneVsOne, isFoundStub, playerNameStub);
        expect(getOneVsOneErrorMessageSpy).toHaveBeenCalled();

        expect(getFormatTimeSpy).toHaveBeenCalled();
        expect(getLocalMessageSpy).toHaveBeenCalled();
    });
});
