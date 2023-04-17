import { GameService } from '@app/services/game/game.service';
import { HistoryService } from '@app/services/history/history.service';
import { RoomsManagerService } from '@app/services/rooms-manager/rooms-manager.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { LimitedModeService } from './limited-mode.service';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { GameEvents, GameModes, RoomEvents } from '@common/enums';
import { ClientSideGame, Coordinate, GameRoom } from '@common/game-interfaces';
import { GameConstantsDto } from '@app/model/dto/game/game-constants.dto';

describe('LimitedModeService', () => {
    let service: LimitedModeService;
    let roomsManagerService: SinonStubbedInstance<RoomsManagerService>;
    let gameService: SinonStubbedInstance<GameService>;
    let historyService: SinonStubbedInstance<HistoryService>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;

    const fakePlayerPayload = {
        gameId: 'testGame',
        playerName: 'testPlayer',
        gameMode: GameModes.ClassicSolo,
    };

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
        roomsManagerService = createStubInstance(RoomsManagerService);
        historyService = createStubInstance(HistoryService);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);

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

    it('createLimitedRoom should call createRoom and emit on RoomLimitedCreated event', async () => {
        const createRoomSpy = jest.spyOn(roomsManagerService, 'createRoom').mockResolvedValueOnce(fakeRoom);
        const updateRoomSpy = jest.spyOn(roomsManagerService, 'updateRoom');
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(RoomEvents.RoomLimitedCreated);
            },
        } as BroadcastOperator<unknown, unknown>);

        await service.createLimitedRoom(socket, fakePlayerPayload, server);
        expect(createRoomSpy).toHaveBeenCalled();
        expect(updateRoomSpy).toHaveBeenCalled();
    });

    it('createLimitedRoom should call createRoom and emit on NoGameAvailable event if room is undefined', async () => {
        const createRoomSpy = jest.spyOn(roomsManagerService, 'createRoom').mockResolvedValueOnce(undefined);
        const updateRoomSpy = jest.spyOn(roomsManagerService, 'updateRoom');
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(RoomEvents.NoGameAvailable);
            },
        } as BroadcastOperator<unknown, unknown>);

        await service.createLimitedRoom(socket, fakePlayerPayload, server);
        expect(createRoomSpy).toHaveBeenCalled();
        expect(updateRoomSpy).not.toHaveBeenCalled();
    });

    it('startNextGame should call getRoomByPlayerId, getGameIds loadNextGame startGame ', async () => {
        service['availableGameByRoomId'].set('testRoom', ['testGame']);
        const getRoomByPlayerIdSpy = jest.spyOn(roomsManagerService, 'getRoomByPlayerId').mockReturnValueOnce(fakeRoom);
        service['getGameIds'] = jest.fn().mockReturnValueOnce('testGame');
        const loadNextGameSpy = jest.spyOn(roomsManagerService, 'loadNextGame').mockResolvedValueOnce('testGameID');
        service['equalizeDifferencesFound'] = jest.fn();
        const startGameSpy = jest.spyOn(roomsManagerService, 'startGame');

        await service.startNextGame(socket, server);
        expect(getRoomByPlayerIdSpy).toHaveBeenCalled();
        expect(service['getGameIds']).toHaveBeenCalled();
        expect(loadNextGameSpy).toHaveBeenCalled();
        expect(startGameSpy).toHaveBeenCalled();
        expect(service['equalizeDifferencesFound']).toHaveBeenCalled();
    });

    it('startNextGame should not call loadNextGame startGame and call endGame instead if nextGameId is undefined', async () => {
        const getRoomByPlayerIdSpy = jest.spyOn(roomsManagerService, 'getRoomByPlayerId').mockReturnValueOnce(fakeRoom);
        service['getGameIds'] = jest.fn();
        const loadNextGameSpy = jest.spyOn(roomsManagerService, 'loadNextGame').mockResolvedValue(undefined);
        service['equalizeDifferencesFound'] = jest.fn();
        const startGameSpy = jest.spyOn(roomsManagerService, 'startGame');
        service['endGame'] = jest.fn();

        await service.startNextGame(socket, server);
        expect(getRoomByPlayerIdSpy).toHaveBeenCalled();
        expect(service['getGameIds']).toHaveBeenCalled();
        expect(loadNextGameSpy).toHaveBeenCalled();
        expect(startGameSpy).not.toHaveBeenCalled();
        expect(service['endGame']).toHaveBeenCalled();
        expect(service['equalizeDifferencesFound']).toHaveBeenCalled();
    });

    it('startNextGame should not call getRoomByPlayerId, getGameIds loadNextGame startGame or endGame if room undefined', async () => {
        const getRoomByPlayerIdSpy = jest.spyOn(roomsManagerService, 'getRoomByPlayerId').mockReturnValueOnce(undefined);
        const loadNextGameSpy = jest.spyOn(roomsManagerService, 'loadNextGame');
        service['equalizeDifferencesFound'] = jest.fn();
        const startGameSpy = jest.spyOn(roomsManagerService, 'startGame');
        service['endGame'] = jest.fn();
        service['getGameIds'] = jest.fn();

        await service.startNextGame(socket, server);
        expect(getRoomByPlayerIdSpy).toHaveBeenCalled();
        expect(service['getGameIds']).not.toHaveBeenCalled();
        expect(loadNextGameSpy).not.toHaveBeenCalled();
        expect(startGameSpy).not.toHaveBeenCalled();
        expect(service['endGame']).not.toHaveBeenCalled();
        expect(service['equalizeDifferencesFound']).not.toHaveBeenCalled();
    });

    it('joinLimitedCoopRoom should call getCreatedCoopRoom, updateRoom and emit on LimitedCoopRoomJoined', () => {
        const getCreatedCoopRoomSpy = jest.spyOn(roomsManagerService, 'getCreatedCoopRoom').mockReturnValueOnce(fakeRoom);
        const updateRoomSpy = jest.spyOn(roomsManagerService, 'updateRoom');
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(RoomEvents.LimitedCoopRoomJoined);
            },
        } as BroadcastOperator<unknown, unknown>);

        service.joinLimitedCoopRoom(socket, fakePlayerPayload, server);

        expect(getCreatedCoopRoomSpy).toHaveBeenCalled();
        expect(updateRoomSpy).toHaveBeenCalled();
    });

    it('joinLimitedCoopRoom should not call getCreatedCoopRoom, updateRoom and emit on LimitedCoopRoomJoined', () => {
        const getCreatedCoopRoomSpy = jest.spyOn(roomsManagerService, 'getCreatedCoopRoom').mockReturnValueOnce(undefined);
        const updateRoomSpy = jest.spyOn(roomsManagerService, 'updateRoom');

        service.joinLimitedCoopRoom(socket, fakePlayerPayload, server);

        expect(getCreatedCoopRoomSpy).toHaveBeenCalled();
        expect(updateRoomSpy).not.toHaveBeenCalled();
    });

    it('checkIfAnyCoopRoomExists should call getCreatedCoopRoom and joinLimitedCoopRoom if room exists', () => {
        const getCreatedCoopRoomSpy = jest.spyOn(roomsManagerService, 'getCreatedCoopRoom').mockReturnValueOnce(fakeRoom);
        const joinLimitedCoopRoomSpy = jest.spyOn(service, 'joinLimitedCoopRoom');

        service.checkIfAnyCoopRoomExists(socket, fakePlayerPayload, server);

        expect(getCreatedCoopRoomSpy).toHaveBeenCalled();
        expect(joinLimitedCoopRoomSpy).toHaveBeenCalled();
    });

    it('checkIfAnyCoopRoomExists should call getCreatedCoopRoom and createLimitedRoom if room does not exist', () => {
        const getCreatedCoopRoomSpy = jest.spyOn(roomsManagerService, 'getCreatedCoopRoom').mockReturnValueOnce(undefined);
        const createLimitedRoomSpy = jest.spyOn(service, 'createLimitedRoom');

        service.checkIfAnyCoopRoomExists(socket, fakePlayerPayload, server);

        expect(getCreatedCoopRoomSpy).toHaveBeenCalled();
        expect(createLimitedRoomSpy).toHaveBeenCalled();
    });

    it('deleteAvailableGame should call delete on availableGameByRoomId', () => {
        const deleteSpy = jest.spyOn(service['availableGameByRoomId'], 'delete');
        service.deleteAvailableGame('testRoom');
        expect(deleteSpy).toHaveBeenCalled();
    });

    it('deletePlayedGameId delete the game id from the availableGameByRoomId', () => {
        service['availableGameByRoomId'].set('testRoom', ['testGame']);
        service.deletePlayedGameId('testRoom', 'testGame');
        expect(service['availableGameByRoomId'].get('testRoom')).toEqual([]);
    });

    it('deletePlayedGameId should not delete the game id from the availableGameByRoomId if the game id is not in the array', () => {
        service['availableGameByRoomId'].set('testRoom', ['testGame']);
        service.deletePlayedGameId('testRoom', 'testGame2');
        expect(service['availableGameByRoomId'].get('testRoom')).toEqual(['testGame']);
    });

    it('deletePlayedGameId should not delete the game id from the availableGameByRoomId if the room id is not in the map', () => {
        service['availableGameByRoomId'].set('testRoom', ['testGame']);
        service.deletePlayedGameId('testRoom2', 'testGame');
        expect(service['availableGameByRoomId'].get('testRoom')).toEqual(['testGame']);
    });

    it('handleDeleteGame should push the game id in all the rooms in the map', () => {
        service['availableGameByRoomId'].set('testRoom', ['testGame']);
        service['availableGameByRoomId'].set('testRoom2', ['testGame']);
        service.handleDeleteGame('testGame');
        expect(service['availableGameByRoomId'].get('testRoom')).toEqual(['testGame', 'testGame']);
        expect(service['availableGameByRoomId'].get('testRoom2')).toEqual(['testGame', 'testGame']);
    });

    it('handleDeleteAllGames should call clear on availableGameByRoomId', () => {
        const clearSpy = jest.spyOn(service['availableGameByRoomId'], 'clear');
        service.handleDeleteAllGames();
        expect(clearSpy).toHaveBeenCalled();
    });

    it('getGameIds should return the game ids in the map and call get on availableGameByRoomId', () => {
        const getSpy = jest.spyOn(service['availableGameByRoomId'], 'get');
        service['availableGameByRoomId'].set('testRoom', ['testGame']);
        expect(service['getGameIds']('testRoom')).toEqual(['testGame']);
        expect(getSpy).toHaveBeenCalled();
    });

    it('endGame should call deleteAvailableGame and deleteRoom,leaveRoom ,sendEndMessage closeEntry', async () => {
        const deleteAvailableGameSpy = jest.spyOn(service, 'deleteAvailableGame');
        const deleteRoomSpy = jest.spyOn(roomsManagerService, 'deleteRoom');
        const leaveRoomSpy = jest.spyOn(roomsManagerService, 'leaveRoom');
        service['sendEndMessage'] = jest.fn();
        const closeEntrySpy = jest.spyOn(historyService, 'closeEntry');
        await service['endGame'](fakeRoom, server);
        expect(deleteAvailableGameSpy).toHaveBeenCalled();
        expect(deleteRoomSpy).toHaveBeenCalled();
        expect(leaveRoomSpy).toHaveBeenCalled();
        expect(service['sendEndMessage']).toHaveBeenCalled();
        expect(closeEntrySpy).toHaveBeenCalled();
    });

    it('equalizeDifferencesFound should emit UpdateDifferencesFound', () => {
        fakeRoom.clientGame.mode = GameModes.LimitedCoop;
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameEvents.UpdateDifferencesFound);
            },
        } as BroadcastOperator<unknown, unknown>);
        service['equalizeDifferencesFound'](fakeRoom, server);
    });

    it('sendEndMessage should emit EndGame', () => {
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameEvents.EndGame);
            },
        } as BroadcastOperator<unknown, unknown>);
        service['sendEndMessage'](fakeRoom, server);
    });
});
