import { GameService } from '@app/services/game/game.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, assert, createStubInstance } from 'sinon';
import { HistoryService } from './history.service';
import { GameConstantsDto } from '@app/model/dto/game/game-constants.dto';
import { Coordinate } from '@common/coordinate';
import { GameRoom, ClientSideGame } from '@common/game-interfaces';
import { Server } from 'socket.io';
import { HistoryEvents, PlayerStatus } from '@common/enums';

describe('HistoryService', () => {
    let service: HistoryService;
    let gameService: SinonStubbedInstance<GameService>;
    let server: SinonStubbedInstance<Server>;

    const fakePlayer = {
        playerId: 'testPlayer',
        name: 'testPlayer',
        differenceData: {
            currentDifference: [{ x: 0, y: 0 }] as Coordinate[],
            differencesFound: 0,
        },
    };
    const gameConfigConstTest: GameConstantsDto = {
        countdownTime: 30,
        penaltyTime: 5,
        bonusTime: 5,
    };
    const fakeRoom: GameRoom = {
        roomId: 'fakeRoomId',
        originalDifferences: [[{ x: 0, y: 0 }]] as Coordinate[][],
        clientGame: {} as ClientSideGame,
        timer: 0,
        endMessage: '',
        player1: fakePlayer,
        player2: fakePlayer,
        gameConstants: gameConfigConstTest,
    };

    beforeEach(async () => {
        gameService = createStubInstance(GameService);
        server = createStubInstance<Server>(Server);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HistoryService,
                {
                    provide: GameService,
                    useValue: gameService,
                },
            ],
        }).compile();

        service = module.get<HistoryService>(HistoryService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('createEntry() should create a new entry in the pendingGames map', () => {
        service.createEntry(fakeRoom);
        expect(service['pendingGames'].size).toBe(1);
    });

    it('createEntry() should not create a new entry in the pendingGames map if the room already exists', () => {
        service.createEntry(fakeRoom);
        service.createEntry(fakeRoom);
        expect(service['pendingGames'].size).toBe(1);
    });

    it('closeEntry() should call gameService.saveGameHistory() with the correct parameters', async () => {
        service.createEntry(fakeRoom);
        await service.closeEntry(fakeRoom.roomId, server);
        expect(gameService.saveGameHistory.calledOnce).toBe(true);
    });

    it('closeEntry() should call server.emit() with the correct parameters', async () => {
        service.createEntry(fakeRoom);
        await service.closeEntry(fakeRoom.roomId, server);
        assert.calledOnce(server.emit);
        assert.calledWith(server.emit, HistoryEvents.RequestReload);
    });

    it('closeEntry() should delete the entry from the pendingGames map', async () => {
        service.createEntry(fakeRoom);
        await service.closeEntry(fakeRoom.roomId, server);
        expect(service['pendingGames'].size).toBe(0);
    });

    it('closeEntry() should not call gameService.saveGameHistory() if the room does not exist', async () => {
        await service.closeEntry(fakeRoom.roomId, server);
        expect(gameService.saveGameHistory.called).toBe(false);
    });

    it('markPlayer should mark the player as a quitter', () => {
        fakeRoom.player2.name = '3';
        service.createEntry(fakeRoom);
        service.markPlayer(fakeRoom.roomId, '3', PlayerStatus.Quitter);
        expect(service['pendingGames'].get(fakeRoom.roomId).player1.isQuitter).toBe(false);
    });

    it('markPlayer should mark the player as a winner', () => {
        service.createEntry(fakeRoom);
        service.markPlayer(fakeRoom.roomId, '3', PlayerStatus.Winner);
        expect(service['pendingGames'].get(fakeRoom.roomId).player1.isWinner).toBe(false);
    });

    it('markPlayer should not mark the player if the room does not exist', () => {
        service.markPlayer(fakeRoom.roomId, fakePlayer.name, PlayerStatus.Quitter);
        expect(service['pendingGames'].size).toBe(0);
    });

    it('markPlayer should not mark the player if the player does not exist', () => {
        service.createEntry(fakeRoom);
        service.markPlayer(fakeRoom.roomId, 'fakePlayer', PlayerStatus.Quitter);
        expect(service['pendingGames'].get(fakeRoom.roomId).player1.isQuitter).toBe(true);
    });

    it('getFormattedDate() should return the correct date', () => {
        const date = new Date();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();
        const formattedDate = service['getFormattedDate'](date);
        expect(formattedDate).toBe(`${year}-${month}-${day}`);
    });

    it('getFormattedTime() should return the correct time', () => {
        const date = new Date();
        const getHoursSpy = jest.spyOn(date, 'getHours');
        const getMinutesSpy = jest.spyOn(date, 'getMinutes');
        const getSecondsSpy = jest.spyOn(date, 'getSeconds');
        service['getFormattedTime'](date);
        expect(getHoursSpy).toHaveBeenCalled();
        expect(getMinutesSpy).toHaveBeenCalled();
        expect(getSecondsSpy).toHaveBeenCalled();
    });
});
