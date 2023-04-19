/* eslint-disable no-unused-vars */
// for -1 index test
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-lines */
// for any test
/* eslint-disable @typescript-eslint/no-explicit-any */
// for id test
/* eslint-disable no-underscore-dangle */
// import { Game } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';
import { HistoryService } from '@app/services/history/history.service';
import { MessageManagerService } from '@app/services/message-manager/message-manager.service';
import { PlayersListManagerService } from '@app/services/players-list-manager/players-list-manager.service';
import { RoomsManagerService } from '@app/services/rooms-manager/rooms-manager.service';
import { Coordinate } from '@common/coordinate';
import { GameEvents, GameModes, PlayerEvents, RoomEvents } from '@common/enums';
import { ClientSideGame, Differences, GameConfigConst, GameRoom, Player, PlayerData } from '@common/game-interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { ClassicModeService } from './classic-mode.service';

describe('ClassicModeService', () => {
    let service: ClassicModeService;
    let messageManagerService: SinonStubbedInstance<MessageManagerService>;
    let gameService: SinonStubbedInstance<GameService>;
    let playersListManagerService: SinonStubbedInstance<PlayersListManagerService>;
    let roomsManagerService: SinonStubbedInstance<RoomsManagerService>;
    let historyService: SinonStubbedInstance<HistoryService>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;

    const clientSideGame: ClientSideGame = {
        id: '1',
        name: 'test',
        isHard: true,
        original: 'data:image/png;base64,test',
        modified: 'data:image/png;base64,test',
        differencesCount: 1,
        mode: '',
    };

    const fakeDiff: Differences = {
        currentDifference: [],
        differencesFound: 0,
    };
    const fakePlayer: Player = {
        playerId: 'testPlayer',
        name: 'testPlayer',
        differenceData: fakeDiff,
    };

    const fakeRoom: GameRoom = {
        roomId: 'fakeRoomId',
        originalDifferences: [[{ x: 0, y: 0 } as Coordinate]],
        clientGame: clientSideGame,
        timer: 0,
        endMessage: '',
        player1: fakePlayer,
        player2: fakePlayer,
        gameConstants: {} as GameConfigConst,
    };

    const fakeData = { gameId: 'fakeRoomId', playerName: 'fakePlayerName' } as PlayerData;

    beforeEach(async () => {
        gameService = createStubInstance(GameService);
        messageManagerService = createStubInstance(MessageManagerService);
        playersListManagerService = createStubInstance(PlayersListManagerService);
        roomsManagerService = createStubInstance(RoomsManagerService);
        historyService = createStubInstance(HistoryService);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClassicModeService,
                {
                    provide: MessageManagerService,
                    useValue: messageManagerService,
                },
                {
                    provide: GameService,
                    useValue: gameService,
                },
                {
                    provide: PlayersListManagerService,
                    useValue: playersListManagerService,
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

        service = module.get<ClassicModeService>(ClassicModeService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('createSoloRoom() should call createClassicRoom() and emit on RoomSoloCreated ', async () => {
        service['createClassicRoom'] = jest.fn().mockReturnValue(fakeRoom);
        server.to.returns({
            emit: (events: string) => {
                expect(events).toBe(RoomEvents.RoomSoloCreated);
            },
        } as BroadcastOperator<unknown, unknown>);
        await service.createSoloRoom(socket, fakeData, server);
    });

    it('createClassicRoom() should call createRoom() and do not emit on RoomCreated (room undefined) ', async () => {
        service['createRoom'] = jest.fn().mockReturnValue(undefined);
        server.to.returns({
            emit: (events: string) => {
                expect(events).not.toBe(RoomEvents.RoomSoloCreated);
            },
        } as BroadcastOperator<unknown, unknown>);
        await service.createSoloRoom(socket, fakeData, server);
    });

    it('createOneVsOneRoom() should call createClassicRoom() and emit on RoomOneVsOneCreated ', async () => {
        service['createClassicRoom'] = jest.fn().mockReturnValue(fakeRoom);
        server.to.returns({
            emit: (events: string) => {
                expect(events).toBe(RoomEvents.RoomOneVsOneCreated);
            },
        } as BroadcastOperator<unknown, unknown>);
        await service.createOneVsOneRoom(socket, fakeData, server);
    });

    it('createClassicRoom() should call createRoom() and do not emit on RoomCreated (room undefined) ', async () => {
        service['createRoom'] = jest.fn().mockReturnValue(undefined);
        server.to.returns({
            emit: (events: string) => {
                expect(events).not.toBe(RoomEvents.RoomOneVsOneCreated);
            },
        } as BroadcastOperator<unknown, unknown>);
        await service.createOneVsOneRoom(socket, fakeData, server);
    });

    it('deleteCreatedRoom() should call deleteRoom() in roomsManagerService', () => {
        const getRoomByIdSpy = jest.spyOn(roomsManagerService, 'getRoomById').mockReturnValue(fakeRoom);
        const deleteRoomSpy = jest.spyOn(roomsManagerService, 'deleteRoom');
        const updateRoomOneVsOneAvailabilitySpy = jest.spyOn(service, 'updateRoomOneVsOneAvailability');
        service.deleteCreatedRoom('id', fakeRoom.roomId, server);
        expect(getRoomByIdSpy).toBeCalled();
        expect(deleteRoomSpy).toBeCalled();
        expect(updateRoomOneVsOneAvailabilitySpy).toBeCalled();
    });

    it('deleteCreatedRoom() should not call deleteRoom() in roomsManagerService (room undefined)', () => {
        const getRoomByIdSpy = jest.spyOn(roomsManagerService, 'getRoomById').mockReturnValue(undefined);
        const deleteRoomSpy = jest.spyOn(roomsManagerService, 'deleteRoom');
        const updateRoomOneVsOneAvailabilitySpy = jest.spyOn(service, 'updateRoomOneVsOneAvailability');
        service.deleteCreatedRoom('id', fakeRoom.roomId, server);
        expect(getRoomByIdSpy).toBeCalled();
        expect(deleteRoomSpy).not.toBeCalled();
        expect(updateRoomOneVsOneAvailabilitySpy).not.toBeCalled();
    });

    it('deleteOneVsOneAvailability() should emit on RoomOneVsOneAvailable and call getGameIdByHostId', () => {
        const getGameIdByHostIdSpy = jest.spyOn(service, 'getGameIdByHostId').mockReturnValue(fakeRoom.clientGame.id);
        server.to.returns({
            emit: (events: string) => {
                expect(events).toBe(RoomEvents.RoomOneVsOneAvailable);
            },
        } as BroadcastOperator<unknown, unknown>);
        service.deleteOneVsOneAvailability(socket, server);
        expect(getGameIdByHostIdSpy).toBeCalled();
    });

    it('deleteOneVsOneAvailability() should not emit on RoomOneVsOneAvailable and call getGameIdByHostId (gameId undefined)', () => {
        const getGameIdByHostIdSpy = jest.spyOn(service, 'getGameIdByHostId').mockReturnValue(undefined);
        server.to.returns({
            emit: (events: string) => {
                expect(events).not.toBe(RoomEvents.RoomOneVsOneAvailable);
            },
        } as BroadcastOperator<unknown, unknown>);
        service.deleteOneVsOneAvailability(socket, server);
        expect(getGameIdByHostIdSpy).toBeCalled();
    });

    it('checkStatus should call getRoomIdFromSocket and getRoomById', async () => {
        fakeRoom.clientGame.mode = GameModes.ClassicSolo;
        fakeRoom.player1.differenceData.differencesFound = 1;
        const getRoomIdFromSocketSpy = jest.spyOn(roomsManagerService, 'getRoomIdFromSocket').mockReturnValue(fakeRoom.roomId);
        const getRoomByIdSpy = jest.spyOn(roomsManagerService, 'getRoomById').mockReturnValue(fakeRoom);
        const endGameSpy = jest.spyOn(service, 'endGame').mockImplementationOnce(async (_fakeRoom, _fakePlayer, _server) => {
            return;
        });
        await service.checkStatus(socket, server);
        expect(getRoomIdFromSocketSpy).toBeCalled();
        expect(getRoomByIdSpy).toBeCalled();
        expect(endGameSpy).toBeCalled();
    });

    it('checkStatus should call getRoomIdFromSocket and getRoomById', async () => {
        fakeRoom.player1.playerId = undefined;
        fakeRoom.clientGame.mode = GameModes.ClassicOneVsOne;
        fakeRoom.player1.differenceData.differencesFound = 1;
        const getRoomIdFromSocketSpy = jest.spyOn(roomsManagerService, 'getRoomIdFromSocket').mockReturnValue(fakeRoom.roomId);
        const getRoomByIdSpy = jest.spyOn(roomsManagerService, 'getRoomById').mockReturnValue(fakeRoom);
        const endGameSpy = jest.spyOn(service, 'endGame').mockImplementationOnce(async (_fakeRoom, _fakePlayer, _server) => {
            return;
        });
        await service.checkStatus(socket, server);
        expect(getRoomIdFromSocketSpy).toBeCalled();
        expect(getRoomByIdSpy).toBeCalled();
        expect(endGameSpy).toBeCalled();
    });

    it('checkStatus should  not call endGame if room is undefined', async () => {
        const getRoomIdFromSocketSpy = jest.spyOn(roomsManagerService, 'getRoomIdFromSocket').mockReturnValue(fakeRoom.roomId);
        const getRoomByIdSpy = jest.spyOn(roomsManagerService, 'getRoomById').mockReturnValue(undefined);
        const endGameSpy = jest.spyOn(service, 'endGame').mockImplementationOnce(async (_fakeRoom, _fakePlayer, _server) => {
            return;
        });
        await service.checkStatus(socket, server);
        expect(getRoomIdFromSocketSpy).toBeCalled();
        expect(getRoomByIdSpy).toBeCalled();
        expect(endGameSpy).not.toBeCalled();
    });

    it('checkStatus should  not call endGame if player is undefined', async () => {
        fakeRoom.player1.playerId = 'xxx';
        fakeRoom.player2 = undefined;
        fakeRoom.clientGame.mode = GameModes.ClassicOneVsOne;
        const getRoomIdFromSocketSpy = jest.spyOn(roomsManagerService, 'getRoomIdFromSocket').mockReturnValue(fakeRoom.roomId);
        const getRoomByIdSpy = jest.spyOn(roomsManagerService, 'getRoomById').mockReturnValue(fakeRoom);
        const endGameSpy = jest.spyOn(service, 'endGame').mockImplementationOnce(async (_fakeRoom, _fakePlayer, _server) => {
            return;
        });
        await service.checkStatus(socket, server);
        expect(getRoomIdFromSocketSpy).toBeCalled();
        expect(getRoomByIdSpy).toBeCalled();
        expect(endGameSpy).not.toBeCalled();
    });

    it('endGame should call updateTopBestTime,deleteJoinedPlayersByGameId,leaveRoom and deleteRoom (ClassicSolo)', async () => {
        fakeRoom.clientGame.mode = GameModes.ClassicSolo;
        const updateTopBestTimeSpy = jest.spyOn(playersListManagerService, 'updateTopBestTime');
        const deleteJoinedPlayersByGameIdSpy = jest.spyOn(playersListManagerService, 'deleteJoinedPlayersByGameId');
        const leaveRoomSpy = jest.spyOn(roomsManagerService, 'leaveRoom');
        const deleteRoomSpy = jest.spyOn(roomsManagerService, 'deleteRoom');
        server.to.returns({
            emit: (events: string) => {
                expect(events).toBe(GameEvents.EndGame);
            },
        } as BroadcastOperator<unknown, unknown>);
        await service.endGame(fakeRoom, fakePlayer, server);
        expect(updateTopBestTimeSpy).toBeCalled();
        expect(deleteJoinedPlayersByGameIdSpy).toBeCalled();
        expect(leaveRoomSpy).toBeCalled();
        expect(deleteRoomSpy).toBeCalled();
    });

    it('endGame should call updateTopBestTime,deleteJoinedPlayersByGameId,leaveRoom and deleteRoom (ClassicOneVsOne)', async () => {
        fakeRoom.clientGame.mode = GameModes.ClassicOneVsOne;
        const updateTopBestTimeSpy = jest.spyOn(playersListManagerService, 'updateTopBestTime').mockResolvedValueOnce(1);
        const deleteJoinedPlayersByGameIdSpy = jest.spyOn(playersListManagerService, 'deleteJoinedPlayersByGameId');
        const leaveRoomSpy = jest.spyOn(roomsManagerService, 'leaveRoom');
        const deleteRoomSpy = jest.spyOn(roomsManagerService, 'deleteRoom');
        server.to.returns({
            emit: (events: string) => {
                expect(events).toBe(GameEvents.EndGame);
            },
        } as BroadcastOperator<unknown, unknown>);
        await service.endGame(fakeRoom, fakePlayer, server);
        expect(updateTopBestTimeSpy).toBeCalled();
        expect(deleteJoinedPlayersByGameIdSpy).toBeCalled();
        expect(leaveRoomSpy).toBeCalled();
        expect(deleteRoomSpy).toBeCalled();
    });

    it('checkRoomOneVsOneAvailability should emit on RoomOneVsOneAvailable', () => {
        service['roomAvailability'].set('id', { gameId: 'id', isAvailableToJoin: false, hostId: 'id' });
        server.to.returns({
            emit: (events: string) => {
                expect(events).toBe(RoomEvents.RoomOneVsOneAvailable);
            },
        } as BroadcastOperator<unknown, unknown>);
        service.checkRoomOneVsOneAvailability('id', 'id', server);
    });

    it('checkRoomOneVsOneAvailability should emit on RoomOneVsOneAvailable(empty map)', () => {
        server.to.returns({
            emit: (events: string) => {
                expect(events).toBe(RoomEvents.RoomOneVsOneAvailable);
            },
        } as BroadcastOperator<unknown, unknown>);
        service.checkRoomOneVsOneAvailability('id', 'id', server);
    });

    it('acceptPlayer should call addAcceptedPlayer in roomsManagerService and emit on PlayerAccepted event', () => {
        const getRoomByIdSpy = jest.spyOn(roomsManagerService, 'getRoomById').mockReturnValueOnce({} as GameRoom);
        const addAcceptedPlayerSpy = jest.spyOn(roomsManagerService, 'addAcceptedPlayer');
        server.to.returns({
            emit: (events: string) => {
                expect(events).toBe(PlayerEvents.PlayerAccepted);
            },
        } as BroadcastOperator<unknown, unknown>);
        service.acceptPlayer({} as Player, 'id', server);
        expect(addAcceptedPlayerSpy).toBeCalled();
        expect(getRoomByIdSpy).toBeCalled();
    });

    it('acceptPlayer should not call addAcceptedPlayer in roomsManagerService and emit on PlayerAccepted event (room undefined)', () => {
        const getRoomByIdSpy = jest.spyOn(roomsManagerService, 'getRoomById').mockReturnValueOnce(undefined);
        const addAcceptedPlayerSpy = jest.spyOn(roomsManagerService, 'addAcceptedPlayer');
        server.to.returns({
            emit: (events: string) => {
                expect(events).toBe(PlayerEvents.PlayerAccepted);
            },
        } as BroadcastOperator<unknown, unknown>);
        service.acceptPlayer({} as Player, 'id', server);
        expect(addAcceptedPlayerSpy).not.toBeCalled();
        expect(getRoomByIdSpy).toBeCalled();
    });

    it('getGameIdByHostId should return the game id ', () => {
        service['roomAvailability'].set(fakeRoom.roomId, { gameId: fakeRoom.roomId, isAvailableToJoin: true, hostId: fakePlayer.playerId });
        const result = service.getGameIdByHostId(fakePlayer.playerId);
        expect(result).toBe(fakeRoom.roomId);
    });

    it('handleSocketDisconnect should call abandonGame ', async () => {
        fakeRoom.clientGame.mode = GameModes.ClassicOneVsOne;
        fakeRoom.player1 = fakePlayer;
        const getGameIdByPlayerIdSpy = jest.spyOn(roomsManagerService, 'getRoomByPlayerId').mockReturnValue(fakeRoom);
        const deleteRoomSpy = jest.spyOn(roomsManagerService, 'deleteRoom');
        const updateRoomOneVsOneAvailabilitySpy = jest.spyOn(service, 'updateRoomOneVsOneAvailability');
        const getSpy = jest.spyOn(service['roomAvailability'], 'get').mockReturnValue({
            gameId: fakeRoom.clientGame.id,
            isAvailableToJoin: true,
            hostId: fakePlayer.playerId,
        });
        const deleteJoinedPlayerByIdSpy = jest.spyOn(playersListManagerService, 'cancelAllJoining');
        await service.handleSocketDisconnect(socket, server);
        expect(getGameIdByPlayerIdSpy).toBeCalled();
        expect(getSpy).toBeCalled();
        expect(deleteJoinedPlayerByIdSpy).toBeCalled();
        expect(updateRoomOneVsOneAvailabilitySpy).toBeCalled();
        expect(deleteRoomSpy).toBeCalled();
    });

    it('handleSocketDisconnect should call deleteOneVsOneRoomAvailability and cancelAllJoining ', async () => {
        fakeRoom.timer = 0;
        fakeRoom.player1 = fakePlayer;
        fakeRoom.player2 = undefined;
        const getGameIdByPlayerIdSpy = jest.spyOn(roomsManagerService, 'getRoomByPlayerId').mockReturnValue(fakeRoom);
        const deleteOneVsOneAvailabilitySpy = jest.spyOn(service, 'deleteOneVsOneAvailability');
        const getSpy = jest.spyOn(service['roomAvailability'], 'get').mockReturnValue({
            gameId: fakeRoom.clientGame.id,
            isAvailableToJoin: false,
            hostId: fakePlayer.playerId,
        });
        await service.handleSocketDisconnect(socket, server);
        expect(getGameIdByPlayerIdSpy).toBeCalled();
        expect(getSpy).toBeCalled();
        expect(deleteOneVsOneAvailabilitySpy).toBeCalled();
    });

    it('handleSocketDisconnect should call deleteOneVsOneRoomAvailability and cancelAllJoining ', async () => {
        fakeRoom.timer = 3;
        fakeRoom.player1 = fakePlayer;
        const getGameIdByPlayerIdSpy = jest.spyOn(roomsManagerService, 'getRoomByPlayerId').mockReturnValue(fakeRoom);
        const abandonGameSpy = jest.spyOn(roomsManagerService, 'abandonGame');
        const getSpy = jest.spyOn(service['roomAvailability'], 'get').mockReturnValue({
            gameId: fakeRoom.clientGame.id,
            isAvailableToJoin: false,
            hostId: fakePlayer.playerId,
        });
        const getGameIdByPlayerIdSpy2 = jest.spyOn(playersListManagerService, 'getGameIdByPlayerId').mockReturnValue('id');
        await service.handleSocketDisconnect(socket, server);
        expect(getGameIdByPlayerIdSpy).toBeCalled();
        expect(getSpy).toBeCalled();
        expect(abandonGameSpy).toBeCalled();
        expect(getGameIdByPlayerIdSpy2).toBeCalled();
    });

    it('handleSocketDisconnect should call getWaitingPlayerNameList and deleteJoinedPlayerByPlayerId (room undefined) ', async () => {
        const getRoomByRoomIdSpy = jest.spyOn(roomsManagerService, 'getRoomByPlayerId').mockReturnValue(undefined);
        const getGameIdByPlayerIdSpy2 = jest.spyOn(playersListManagerService, 'getGameIdByPlayerId').mockReturnValue('id');
        const getHostIdByGameIdSpy = jest.spyOn(roomsManagerService, 'getHostIdByGameId');
        const deleteJoinedPlayerByPlayerIdSpy = jest.spyOn(playersListManagerService, 'deleteJoinedPlayerByPlayerId');
        const getWaitingPlayerNameListSpy = jest.spyOn(playersListManagerService, 'getWaitingPlayerNameList');
        await service.handleSocketDisconnect(socket, server);
        expect(getGameIdByPlayerIdSpy2).toBeCalled();
        expect(getHostIdByGameIdSpy).toBeCalled();
        expect(getRoomByRoomIdSpy).toBeCalled();
        expect(deleteJoinedPlayerByPlayerIdSpy).toBeCalled();
        expect(getWaitingPlayerNameListSpy).toBeCalled();
    });

    it('createClassicRoom should call createRoom and updateRoom', async () => {
        const createRoomSpy = jest.spyOn(roomsManagerService, 'createRoom').mockResolvedValue(fakeRoom);
        const updateRoomSpy = jest.spyOn(roomsManagerService, 'updateRoom');
        await service['createClassicRoom'](socket, fakeData);
        expect(createRoomSpy).toBeCalled();
        expect(updateRoomSpy).toBeCalled();
    });

    it('checkStatus should call getRoomIdFromSocket and getRoomById', async () => {
        fakeRoom.clientGame.mode = GameModes.ClassicSolo;
        fakeRoom.player1.differenceData.differencesFound = 1;
        const getRoomIdFromSocketSpy = jest.spyOn(roomsManagerService, 'getRoomIdFromSocket').mockReturnValue(fakeRoom.roomId);
        const getRoomByIdSpy = jest.spyOn(roomsManagerService, 'getRoomById').mockReturnValue(fakeRoom);
        const endGameSpy = jest.spyOn(service, 'endGame').mockImplementationOnce(async (_fakeRoom, _fakePlayer, _server) => {
            return;
        });
        await service.checkStatus(socket, server);
        expect(getRoomIdFromSocketSpy).toBeCalled();
        expect(getRoomByIdSpy).toBeCalled();
        expect(endGameSpy).toBeCalled();
    });

    it('checkStatus should call getRoomIdFromSocket and getRoomById', async () => {
        fakeRoom.player1.playerId = undefined;
        fakeRoom.clientGame.mode = GameModes.ClassicOneVsOne;
        fakeRoom.player1.differenceData.differencesFound = 1;
        const getRoomIdFromSocketSpy = jest.spyOn(roomsManagerService, 'getRoomIdFromSocket').mockReturnValue(fakeRoom.roomId);
        const getRoomByIdSpy = jest.spyOn(roomsManagerService, 'getRoomById').mockReturnValue(fakeRoom);
        const endGameSpy = jest.spyOn(service, 'endGame').mockImplementationOnce(async (_fakeRoom, _fakePlayer, _server) => {
            return;
        });
        await service.checkStatus(socket, server);
        expect(getRoomIdFromSocketSpy).toBeCalled();
        expect(getRoomByIdSpy).toBeCalled();
        expect(endGameSpy).toBeCalled();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
