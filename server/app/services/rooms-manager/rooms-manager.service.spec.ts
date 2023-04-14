/* eslint-disable max-lines */
/* eslint-disable no-unused-vars */
import { Game } from '@app/model/database/game';
import { GameConstantsDto } from '@app/model/dto/game/game-constants.dto';
import { GameService } from '@app/services/game/game.service';
import { HistoryService } from '@app/services/history/history.service';
import { MessageManagerService } from '@app/services/message-manager/message-manager.service';
import { KEY_SIZE, MAX_BONUS_TIME_ALLOWED, NOT_FOUND } from '@common/constants';
import { GameEvents, GameModes, MessageEvents } from '@common/enums';
import { ClientSideGame, Coordinate, Differences, GameRoom } from '@common/game-interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import { SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { RoomsManagerService } from './rooms-manager.service';

describe('RoomsManagerService', () => {
    let service: RoomsManagerService;
    let gameService: SinonStubbedInstance<GameService>;
    let messageManager: SinonStubbedInstance<MessageManagerService>;
    let historyService: SinonStubbedInstance<HistoryService>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;

    const modeTimerMap = {
        [GameModes.ClassicSolo]: { isCountdown: false },
        [GameModes.ClassicOneVsOne]: { isCountdown: false, requiresPlayer2: true },
        [GameModes.LimitedSolo]: { isCountdown: true },
        [GameModes.LimitedCoop]: { isCountdown: true, requiresPlayer2: true },
    };

    const fakePlayerPayload = {
        gameId: 'testGame',
        playerName: 'testPlayer',
        gameMode: GameModes.ClassicSolo,
    };

    const testGames: Game[] = [
        {
            _id: '1',
            name: 'test',
            isHard: true,
            originalImage: 'test',
            modifiedImage: 'test',
            nDifference: 1,
            differences: 'test',
        },
    ];

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

    const fakeDiff: Differences = {
        currentDifference: [{ x: 0, y: 0 }] as Coordinate[],
        differencesFound: 0,
    };

    beforeEach(async () => {
        gameService = createStubInstance(GameService);
        messageManager = createStubInstance(MessageManagerService);
        historyService = createStubInstance(HistoryService);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
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
                {
                    provide: HistoryService,
                    useValue: historyService,
                },
            ],
        }).compile();

        service = module.get<RoomsManagerService>(RoomsManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('onModuleInit() should call getGameConstants()', async () => {
        const getGameConstantsSpy = jest.spyOn(service, 'getGameConstants');
        await service.onModuleInit();
        expect(getGameConstantsSpy).toBeCalled();
    });

    it('createRoom() should return a room and call getRandomGame if game undefined ', async () => {
        fakePlayerPayload.gameId = undefined;
        const getGameByIdSpy = jest.spyOn(gameService, 'getGameById').mockResolvedValueOnce(undefined);
        service['buildGameRoom'] = jest.fn().mockReturnValueOnce(fakeRoom);
        const getRandomGameSpy = jest.spyOn(gameService, 'getRandomGame').mockResolvedValueOnce(testGames[0]);
        await service.createRoom(fakePlayerPayload);
        expect(getRandomGameSpy).toBeCalled();
        expect(service['buildGameRoom']).toBeCalled();
        expect(getGameByIdSpy).not.toBeCalled();
    });

    it('createRoom() should return a room and call getGameById if game defined ', async () => {
        fakePlayerPayload.gameId = 'testGame';
        const getGameByIdSpy = jest.spyOn(gameService, 'getGameById').mockResolvedValueOnce(testGames[0]);
        service['buildGameRoom'] = jest.fn().mockReturnValueOnce(fakeRoom);
        const getRandomGameSpy = jest.spyOn(gameService, 'getRandomGame');
        await service.createRoom(fakePlayerPayload);
        expect(getGameByIdSpy).toBeCalled();
        expect(service['buildGameRoom']).toBeCalled();
        expect(getRandomGameSpy).not.toBeCalled();
    });

    it('createRoom() should not call buildGameRoom if game undefined ', async () => {
        fakePlayerPayload.gameId = 'testGame';
        const getGameByIdSpy = jest.spyOn(gameService, 'getGameById').mockResolvedValueOnce(undefined);
        service['buildGameRoom'] = jest.fn().mockReturnValueOnce(fakeRoom);
        await service.createRoom(fakePlayerPayload);
        expect(service['buildGameRoom']).not.toBeCalled();
        expect(getGameByIdSpy).toBeCalled();
    });

    it('getGameConstants() should call getGameConstants return the game constants', async () => {
        const getGameConstantsSpy = jest.spyOn(gameService, 'getGameConstants').mockResolvedValueOnce(gameConfigConstTest);
        await service.getGameConstants();
        expect(getGameConstantsSpy).toBeCalled();
        expect(service['gameConstants']).toEqual(gameConfigConstTest);
    });

    it('getRoomById() should return the room if it exists', () => {
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        const room = service.getRoomById(fakeRoom.roomId);
        expect(room).toEqual(fakeRoom);
    });

    it('getRoomById() should return undefined if the room does not exist', () => {
        const room = service.getRoomById(fakeRoom.roomId);
        expect(room).toBeUndefined();
    });

    it('getRoomIdFromSocket() should call from and values', () => {
        stub(socket, 'rooms').value(new Set(['fakeRoomId']));
        const valuesSpy = jest.spyOn(socket.rooms, 'values');
        const fromSpy = jest.spyOn(Array, 'from');
        service.getRoomIdFromSocket(socket);
        expect(fromSpy).toBeCalled();
        expect(valuesSpy).toBeCalled();
    });

    it('getRoomByPlayerId should return the room  (player1 case)', () => {
        fakeRoom.player1.playerId = '1';
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        const findSpy = jest.spyOn(Array.prototype, 'find');
        const result = service.getRoomByPlayerId('1');
        expect(result).toEqual(fakeRoom);
        expect(findSpy).toBeCalled();
    });

    it('getRoomByPlayerId should return the room  (player2 case)', () => {
        fakeRoom.player2.playerId = undefined;
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        const findSpy = jest.spyOn(Array.prototype, 'find');
        const result = service.getRoomByPlayerId('2');
        expect(result).toEqual(undefined);
        expect(findSpy).toBeCalled();
    });

    it('getRoomByPlayerId should return the undefined ', () => {
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        const findSpy = jest.spyOn(Array.prototype, 'find');
        const result = service.getRoomByPlayerId('df');
        expect(result).toEqual(undefined);
        expect(findSpy).toBeCalled();
    });
    it('getHostIdByGameId should return the host id', () => {
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        const result = service.getHostIdByGameId(fakeRoom.clientGame.id);
        expect(result).toEqual(fakeRoom.player1.playerId);
    });

    it('getRoomByPlayerId() should return the room if it exists', () => {
        const result = service.getHostIdByGameId(fakeRoom.clientGame.id);
        expect(result).toBeUndefined();
    });

    it('getCreatedCoopRoom should return the room if it exists', () => {
        fakeRoom.player2 = undefined;
        fakeRoom.clientGame.mode = GameModes.LimitedCoop;
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        const result = service.getCreatedCoopRoom();
        expect(result).toEqual(fakeRoom);
    });

    it('addAcceptedPlayer() should add the player to the room and call getRoomById and updateRoom ', () => {
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        const getRoomByIdSpy = jest.spyOn(service, 'getRoomById').mockReturnValueOnce(fakeRoom);
        const updateRoomSpy = jest.spyOn(service, 'updateRoom');
        service.addAcceptedPlayer(fakeRoom.roomId, fakePlayer);
        expect(getRoomByIdSpy).toBeCalled();
        expect(updateRoomSpy).toBeCalled();
        expect(fakeRoom.player2).toEqual(fakePlayer);
    });

    it('updateRoom() should call set', () => {
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        const setSpy = jest.spyOn(service['rooms'], 'set');
        service.updateRoom(fakeRoom);
        expect(setSpy).toBeCalled();
    });

    it('deleteRoom() should call delete', () => {
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        const deleteSpy = jest.spyOn(service['rooms'], 'delete');
        service.deleteRoom(fakeRoom.roomId);
        expect(deleteSpy).toBeCalled();
    });

    it('isMultiplayerGame() should return true if the game is multiplayer', () => {
        fakeRoom.clientGame.mode = GameModes.LimitedCoop;
        const result = service.isMultiplayerGame(fakeRoom.clientGame);
        expect(result).toEqual(true);
        fakeRoom.clientGame.mode = GameModes.ClassicOneVsOne;
        const result1 = service.isMultiplayerGame(fakeRoom.clientGame);
        expect(result1).toEqual(true);
    });

    it('startGame() should call getRoomById,getRoomIdByPlayerId,join and updateRoom and emit on GameStarted event ', () => {
        fakeRoom.player2.playerId = undefined;
        Object.defineProperty(socket, 'id', {
            value: fakeRoom.player1.playerId,
        });
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        const getRoomIdByPlayerIdSpy = jest.spyOn(service, 'getRoomByPlayerId').mockReturnValueOnce(fakeRoom);
        service['handleGamePageRefresh'] = jest.fn();
        const joinSpy = jest.spyOn(socket, 'join');
        const updateRoomSpy = jest.spyOn(service, 'updateRoom');
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameEvents.GameStarted);
            },
        } as BroadcastOperator<unknown, unknown>);
        service.startGame(socket, server);
        expect(service['handleGamePageRefresh']).not.toBeCalled();
        expect(getRoomIdByPlayerIdSpy).toBeCalled();
        expect(joinSpy).toBeCalled();
        expect(updateRoomSpy).toBeCalled();
        expect([fakeRoom.player1.playerId, fakeRoom.player2?.playerId].includes(socket.id)).toBeTruthy();
        fakeRoom.player2 = fakePlayer;
    });

    it('startGame() should not call join and updateRoom and emit on GameStarted event if the room does not exist', () => {
        fakeRoom.player1.playerId = 'fakePlayerId';
        Object.defineProperty(socket, 'id', {
            value: fakeRoom.player2.playerId,
        });
        const getRoomByPlayerIdSpy = jest.spyOn(service, 'getRoomByPlayerId').mockReturnValueOnce(undefined);
        const joinSpy = jest.spyOn(socket, 'join');
        const updateRoomSpy = jest.spyOn(service, 'updateRoom');
        service['handleGamePageRefresh'] = jest.fn();
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameEvents.GamePageRefreshed);
            },
        } as BroadcastOperator<unknown, unknown>);
        service.startGame(socket, server);
        expect(service['handleGamePageRefresh']).toBeCalled();
        expect(getRoomByPlayerIdSpy).toBeCalled();
        expect(joinSpy).not.toBeCalled();
        expect(updateRoomSpy).not.toBeCalled();
    });

    it('loadNextGame() should call getRandomGame, buildClientGameVersion, structuredClone and updateRoom ', async () => {
        const getRandomGameSpy = jest.spyOn(gameService, 'getRandomGame').mockResolvedValueOnce(testGames[0]);
        jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() => JSON.stringify(testGames[0]));
        jest.spyOn(JSON, 'parse').mockReturnValueOnce(testGames[0]);
        service['buildClientGameVersion'] = jest.fn().mockReturnValueOnce(fakeRoom.clientGame);
        const updateRoomSpy = jest.spyOn(service, 'updateRoom');
        await service.loadNextGame(fakeRoom, []);
        expect(service['buildClientGameVersion']).toBeCalled();
        expect(getRandomGameSpy).toBeCalled();
        expect(updateRoomSpy).toBeCalled();
    });

    it('loadNextGame() should not call buildClientGameVersion, structuredClone and updateRoom if game is undefined', async () => {
        const getRandomGameSpy = jest.spyOn(gameService, 'getRandomGame').mockResolvedValueOnce(undefined);
        service['buildClientGameVersion'] = jest.fn().mockReturnValueOnce(fakeRoom.clientGame);
        const updateRoomSpy = jest.spyOn(service, 'updateRoom');
        await service.loadNextGame(fakeRoom, []);
        expect(service['buildClientGameVersion']).not.toBeCalled();
        expect(getRandomGameSpy).toBeCalled();
        expect(updateRoomSpy).not.toBeCalled();
    });

    it('validateCoords should not call differenceFound or differenceNotFound dont emit on LocalMessage,RemoveDiff if the room is undefined', () => {
        const getRoomIdFromSocketSpy = jest.spyOn(service, 'getRoomIdFromSocket').mockReturnValue(undefined);
        service['differenceFound'] = jest.fn();
        service['differenceNotFound'] = jest.fn();
        service.validateCoords(socket, { x: 0, y: 0 }, server);
        expect(getRoomIdFromSocketSpy).toBeCalled();
        expect(service['differenceFound']).not.toBeCalled();
        expect(service['differenceNotFound']).not.toBeCalled();
    });

    it('validateCoords() should call  differenceFound and emit on LocalMessage,RemoveDiff if the coordinates are correct', () => {
        fakeRoom.originalDifferences = [
            [
                { x: 0, y: 0 },
                { x: 3, y: 2 },
            ],
        ] as Coordinate[][];
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        Array.prototype.findIndex = jest.fn().mockImplementationOnce(() => 0);
        Array.prototype.some = jest.fn().mockImplementationOnce(() => true);
        service['differenceFound'] = jest.fn();
        const getRoomIdFromSocketSpy = jest.spyOn(service, 'getRoomIdFromSocket').mockReturnValue(fakeRoom.roomId);
        server.to.returns({
            emit: (event: string) => {
                if (event === MessageEvents.LocalMessage) {
                    expect(event).toEqual(MessageEvents.LocalMessage);
                } else if (event === GameEvents.RemoveDifference) {
                    expect(event).toEqual(GameEvents.RemoveDifference);
                }
            },
        } as BroadcastOperator<unknown, unknown>);
        service.validateCoords(socket, { x: 0, y: 0 }, server);
        expect(getRoomIdFromSocketSpy).toBeCalled();
        expect(service['differenceFound'] as jest.Mock).toBeCalled();
    });

    it('validateCoords() should call differenceNotFound and emit on LocalMessage,RemoveDiff if the coordinates are not correct', () => {
        fakeRoom.originalDifferences = [[{ x: 0, y: 0 }]] as Coordinate[][];
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        Array.prototype.findIndex = jest.fn().mockImplementationOnce(() => NOT_FOUND);
        Array.prototype.some = jest.fn().mockImplementationOnce(() => false);
        service['differenceNotFound'] = jest.fn();
        const getRoomIdFromSocketSpy = jest.spyOn(service, 'getRoomIdFromSocket').mockReturnValue(fakeRoom.roomId);
        server.to.returns({
            emit: (event: string) => {
                if (event === MessageEvents.LocalMessage) {
                    expect(event).toEqual(MessageEvents.LocalMessage);
                } else if (event === GameEvents.RemoveDifference) {
                    expect(event).toEqual(GameEvents.RemoveDifference);
                }
            },
        } as BroadcastOperator<unknown, unknown>);
        service.validateCoords(socket, { x: 2, y: 2 }, server);
        expect(getRoomIdFromSocketSpy).toBeCalled();
        expect(service['differenceNotFound'] as jest.Mock).toBeCalled();
    });

    it('updateTimers() should call updateTimer if game mode is classic ', () => {
        service['modeTimerMap'] = modeTimerMap;
        fakeRoom.clientGame.mode = GameModes.ClassicSolo;
        const fakeRoom2 = { ...fakeRoom };
        fakeRoom2.clientGame.mode = GameModes.ClassicOneVsOne;
        service['rooms'].set(fakeRoom2.roomId, fakeRoom2);
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        service['updateTimer'] = jest.fn();
        service.updateTimers(server);
        expect(service['updateTimer']).toBeCalled();
    });

    it('updateTimers() should not call updateTimer if room is undefined ', () => {
        service['modeTimerMap'] = modeTimerMap;
        fakeRoom.clientGame.mode = GameModes.ClassicOneVsOne;
        fakeRoom.player2 = undefined;
        service['rooms'].set(fakeRoom.roomId, undefined);
        service['updateTimer'] = jest.fn();
        service.updateTimers(server);
        expect(service['updateTimer']).not.toBeCalled();
    });

    it('addHintPenalty() should call getRoomIdFromSocket and decrease penaltyTime if  game mode is limited', () => {
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        const getRoomIdFromSocketSpy = jest.spyOn(service, 'getRoomIdFromSocket').mockReturnValue(fakeRoom.roomId);
        service['countdownOver'] = jest.fn().mockImplementationOnce(() => {
            return;
        });
        const getRoomByIdSpy = jest.spyOn(service, 'getRoomById').mockReturnValue(fakeRoom);
        const isLimitedModeGameSpy = jest.spyOn(service, 'isLimitedModeGame').mockReturnValue(true);
        service.addHintPenalty(socket, server);
        expect(getRoomIdFromSocketSpy).toBeCalled();
        expect(getRoomByIdSpy).toBeCalled();
        expect(isLimitedModeGameSpy).toBeCalled();
    });

    it('addHintPenalty() should call getRoomIdFromSocket and not decrease penaltyTime if  game mode is not limited', () => {
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        const getRoomIdFromSocketSpy = jest.spyOn(service, 'getRoomIdFromSocket').mockReturnValue(fakeRoom.roomId);
        service['countdownOver'] = jest.fn().mockImplementationOnce(() => {
            return;
        });
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameEvents.TimerUpdate);
            },
        } as BroadcastOperator<unknown, unknown>);

        const getRoomByIdSpy = jest.spyOn(service, 'getRoomById').mockReturnValue(fakeRoom);
        const isLimitedModeGameSpy = jest.spyOn(service, 'isLimitedModeGame').mockReturnValue(false);
        service.addHintPenalty(socket, server);
        expect(getRoomIdFromSocketSpy).toBeCalled();
        expect(getRoomByIdSpy).toBeCalled();
        expect(isLimitedModeGameSpy).toBeCalled();
    });

    it('addHintPenalty() should not call countdownOver or emit if room is undefined', () => {
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        const getRoomIdFromSocketSpy = jest.spyOn(service, 'getRoomIdFromSocket').mockReturnValue(fakeRoom.roomId);
        service['countdownOver'] = jest.fn().mockImplementationOnce(() => {
            return;
        });
        const getRoomByIdSpy = jest.spyOn(service, 'getRoomById').mockReturnValue(undefined);
        const isLimitedModeGameSpy = jest.spyOn(service, 'isLimitedModeGame').mockReturnValue(true);
        service.addHintPenalty(socket, server);
        expect(getRoomIdFromSocketSpy).toBeCalled();
        expect(getRoomByIdSpy).toBeCalled();
        expect(isLimitedModeGameSpy).not.toBeCalled();
        expect(service['countdownOver'] as jest.Mock).not.toBeCalled();
    });

    it('isLimitedModeGame() should return true if game mode is limited', () => {
        fakeRoom.clientGame.mode = GameModes.LimitedSolo;
        expect(service.isLimitedModeGame(fakeRoom.clientGame)).toEqual(true);
        fakeRoom.clientGame.mode = GameModes.LimitedCoop;
        expect(service.isLimitedModeGame(fakeRoom.clientGame)).toEqual(true);
    });

    it('leaveRoom() should remove the room socket rooms', () => {
        const sockets = new Map<string, Socket>([
            ['testPlayer', socket],
            ['testPlayer', socket],
        ]);

        const mapStub = stub(sockets, 'get');
        mapStub.withArgs('testPlayer').returns(socket);
        mapStub.withArgs('testPlayer').returns(socket);

        Object.defineProperty(server, 'sockets', {
            value: { sockets },
        });
        fakeRoom.player1.playerId = 'testPlayer';
        stub(socket, 'rooms').value(new Set<string>(['room1', 'room2']));
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        const deleteSpy = jest.spyOn(socket.rooms, 'delete');
        service.leaveRoom(fakeRoom, server);
        expect(deleteSpy).toBeCalled();
    });

    it('abandonGame() should call handleOneVsOneAbandon if ClassicOneVsOne ', () => {
        Object.defineProperty(socket, 'id', {
            value: 'testPlayer',
        });
        fakeRoom.clientGame.mode = GameModes.ClassicOneVsOne;
        fakeRoom.player2 = fakePlayer;
        service['isMultiplayerGame'] = jest.fn().mockReturnValueOnce(true);
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(MessageEvents.LocalMessage);
            },
        } as BroadcastOperator<unknown, unknown>);

        jest.spyOn(service, 'getRoomById').mockReturnValueOnce(fakeRoom);
        fakeRoom.clientGame.mode = GameModes.ClassicOneVsOne;
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        service['handleOneVsOneAbandon'] = jest.fn();
        service.abandonGame(socket, server);
        expect(service['handleOneVsOneAbandon']).toBeCalled();
    });

    it('abandonGame() should call handleCoopAbandon if LimitedCoop ', () => {
        Object.defineProperty(socket, 'id', {
            value: 'testPlayer',
        });
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(MessageEvents.LocalMessage);
            },
        } as BroadcastOperator<unknown, unknown>);
        fakeRoom.clientGame.mode = GameModes.LimitedCoop;
        service['isMultiplayerGame'] = jest.fn().mockReturnValueOnce(true);
        fakeRoom.player1.playerId = 'testPlayer1';
        jest.spyOn(service, 'getRoomByPlayerId').mockReturnValueOnce(fakeRoom);
        fakeRoom.clientGame.mode = GameModes.LimitedCoop;
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        service['handleCoopAbandon'] = jest.fn();
        service.abandonGame(socket, server);
        expect(service['handleCoopAbandon']).toBeCalled();
    });

    // it('abandonGame() should NOT call handleOneVsOneAbandon OR handleCoopAbandon if game mode is not multi ', () => {
    //     jest.spyOn(service, 'getRoomByPlayerId').mockReturnValueOnce(fakeRoom);
    //     service['isMultiplayerGame'] = jest.fn().mockReturnValueOnce(false);
    //     const deleteRoomSpy = jest.spyOn(service, 'deleteRoom');
    //     service.abandonGame(socket, server);
    //     expect(deleteRoomSpy).toBeCalled();
    // });

    it('abandonGame() should NOT call handleOneVsOneAbandon OR handleCoopAbandon if room undefined ', () => {
        jest.spyOn(service, 'getRoomById').mockReturnValue(undefined);
        service['handleOneVsOneAbandon'] = jest.fn();
        service['handleCoopAbandon'] = jest.fn();
        service.abandonGame(socket, server);
        expect(service['handleOneVsOneAbandon']).not.toBeCalled();
        expect(service['handleCoopAbandon']).not.toBeCalled();
    });

    it('handleDisconnect() should call deleteRoom ', () => {
        fakeRoom.player2 = undefined;
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        const deleteRoomSpy = jest.spyOn(service, 'deleteRoom');
        service.handleDisconnect(fakeRoom);
        expect(deleteRoomSpy).toBeCalled();
    });

    it('handleGamePageRefresh() should emit on GamePageRefreshed event', () => {
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameEvents.GamePageRefreshed);
            },
        } as BroadcastOperator<unknown, unknown>);
        service['handleGamePageRefresh'](socket, server);
    });

    it('buildGameRoom() should return a game room', () => {
        service['generateRoomId'] = jest.fn().mockReturnValue('testRoomId');
        const readFileSyncSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue('test');
        const parseSpy = jest.spyOn(JSON, 'parse').mockReturnValue({} as ClientSideGame);
        server['buildClientGameVersion'] = jest.fn().mockReturnValue({} as ClientSideGame);
        const gameRoom = service['buildGameRoom'](testGames[0], fakePlayerPayload);
        expect(gameRoom).toBeDefined();
        expect(readFileSyncSpy).toBeCalled();
        expect(parseSpy).toBeCalled();
    });

    it('buildClientGameVersion() should return a ClientSideGame', () => {
        jest.spyOn(fs, 'readFileSync').mockReturnValue('test');
        const result = service['buildClientGameVersion'](testGames[0]);
        result.mode = GameModes.ClassicOneVsOne;
        expect(result).toBeDefined();
    });

    // it('handleOneVsOneAbandon() should call abandonMessage and deleteRoom emit on EndGame event', () => {
    //     service['deleteRoom'] = jest.fn();
    //     service['leaveRoom'] = jest.fn();
    //     server.to.returns({
    //         emit: (event: string) => {
    //             if (event === GameEvents.EndGame) {
    //                 expect(event).toEqual(GameEvents.EndGame);
    //             } else if (event === MessageEvents.LocalMessage) {
    //                 expect(event).toEqual(MessageEvents.LocalMessage);
    //             }
    //         },
    //     } as BroadcastOperator<unknown, unknown>);
    //     service['handleOneVsOneAbandon'](fakePlayer, fakeRoom, server);
    //     expect(service['deleteRoom']).toBeCalled();
    //     expect(service['leaveRoom']).toBeCalled();
    // });

    it('handleCoopAbandon() should call abandonMessage and deleteRoom emit on EndGame event', () => {
        service['updateRoom'] = jest.fn();
        server.to.returns({
            emit: (event: string) => {
                if (event === GameEvents.GameModeChanged) {
                    expect(event).toEqual(GameEvents.GameModeChanged);
                } else if (event === MessageEvents.LocalMessage) {
                    expect(event).toEqual(MessageEvents.LocalMessage);
                }
            },
        } as BroadcastOperator<unknown, unknown>);
        service['handleCoopAbandon'](fakePlayer, fakeRoom, server);
        expect(service['updateRoom']).toBeCalled();
    });

    it('differenceFound() should call updateRoom,addBonusTime and getLocalMessage', () => {
        service['updateRoom'] = jest.fn();
        service['addBonusTime'] = jest.fn();
        const messageManagerSpy = jest.spyOn(messageManager, 'getLocalMessage');
        service['differenceFound'](fakeRoom, fakePlayer, 0);
        expect(service['updateRoom']).toBeCalled();
        expect(service['addBonusTime']).toBeCalled();
        expect(messageManagerSpy).toBeCalled();
    });

    it('differenceNotFound should call updateRoom and getLocalMessage', () => {
        service['updateRoom'] = jest.fn();
        const messageManagerSpy = jest.spyOn(messageManager, 'getLocalMessage');
        service['differenceNotFound'](fakeRoom, fakePlayer);
        expect(service['updateRoom']).toBeCalled();
        expect(messageManagerSpy).toBeCalled();
    });

    it('addBonusTime calls updateRoom if game mode is limited', () => {
        const isLimitedModeGameSpy = jest.spyOn(service, 'isLimitedModeGame').mockReturnValue(true);
        fakeRoom.timer = MAX_BONUS_TIME_ALLOWED + 1;
        service['updateRoom'] = jest.fn();
        service['addBonusTime'](fakeRoom);
        expect(service['updateRoom']).toBeCalled();
    });

    it('addBonusTime does not call updateRoom if game mode is not limited', () => {
        const isLimitedModeGameSpy = jest.spyOn(service, 'isLimitedModeGame').mockReturnValue(false);
        service['updateRoom'] = jest.fn();
        service['addBonusTime'](fakeRoom);
        expect(service['updateRoom']).not.toBeCalled();
    });

    it('updateTimer should call updateRoom and emit on TimerUpdate event(isCountdown false)', () => {
        service['updateRoom'] = jest.fn();
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameEvents.TimerUpdate);
            },
        } as BroadcastOperator<unknown, unknown>);
        service['updateTimer'](fakeRoom, server, false);
        expect(service['updateRoom']).toBeCalled();
    });

    it('updateTimer should call updateRoom and emit on TimerUpdate event(isCountdown true)', () => {
        fakeRoom.timer = 1;
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        service['updateRoom'] = jest.fn();
        service['countdownOver'] = jest.fn();
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameEvents.TimerUpdate);
            },
        } as BroadcastOperator<unknown, unknown>);
        service['updateTimer'](fakeRoom, server, true);
        expect(service['updateRoom']).toBeCalled();
        expect(service['countdownOver']).toBeCalled();
    });

    it('countdownOver should call deleteRoom,leaveRoom and emit on EndGame event', () => {
        service['deleteRoom'] = jest.fn();
        service['leaveRoom'] = jest.fn();
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameEvents.EndGame);
            },
        } as BroadcastOperator<unknown, unknown>);
        service['countdownOver'](fakeRoom, server);
        expect(service['deleteRoom']).toBeCalled();
        expect(service['leaveRoom']).toBeCalled();
    });

    it('generateRoomId should return a string of length 6', () => {
        const roomId = service['generateRoomId']();
        expect(roomId.length).toEqual(KEY_SIZE);
    });
});
