/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle */
import { Game } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';
import { Coordinate } from '@common/coordinate';
import { ClassicPlayRoom, ClientSideGame, Differences, GameEvents, GameModes, MessageEvents, Player } from '@common/game-interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { ClassicModeService } from './classic-mode.service';
import { MessageManagerService } from '@app/services/message-manager/message-manager.service';

describe('ClassicModeService', () => {
    let service: ClassicModeService;
    let messageManagerService: SinonStubbedInstance<MessageManagerService>;
    let gameService: SinonStubbedInstance<GameService>;
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
    const diffData: Differences = {
        currentDifference: [],
        differencesFound: 0,
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

    const fakeDiff: Differences = {
        currentDifference: [],
        differencesFound: 0,
    };
    const fakePlayer: Player = {
        playerId: 'testPlayer',
        name: 'testPlayer',
        diffData: fakeDiff,
    };

    const fakeRoom: ClassicPlayRoom = {
        roomId: 'fakeRoomId',
        originalDifferences: [[{ x: 0, y: 0 } as Coordinate]],
        clientGame: clientSideGame,
        timer: 0,
        endMessage: '',
    };

    const fakePlayer2: Player = {
        playerId: 'testPlayer2',
        name: 'testPlayer2',
        diffData: { currentDifference: [], differencesFound: 1 },
    };

    const fakeRoom2: ClassicPlayRoom = {
        roomId: 'fakeRoomId2',
        originalDifferences: [[{ x: 0, y: 0 } as Coordinate]],
        clientGame: clientSideGame,
        timer: 0,
        endMessage: '',
        player1: fakePlayer2,
        player2: fakePlayer2,
    };

    beforeEach(async () => {
        gameService = createStubInstance(GameService);
        messageManagerService = createStubInstance(MessageManagerService);
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
            ],
        }).compile();

        service = module.get<ClassicModeService>(ClassicModeService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('createRoom() should create a new classic room', async () => {
        const generateRoomIdSpy = jest.spyOn(service as any, 'generateRoomId').mockImplementation(() => 'fakeRoomId');
        const readFileSyncSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue('test');
        const parseSpy = jest.spyOn(JSON, 'parse').mockReturnValue([[{ x: 0, y: 0 } as Coordinate]]);
        gameService.getGameById.resolves(testGames[0]);
        const buildClientGameVersionSpy = jest.spyOn(service, 'buildClientGameVersion');
        await service.createRoom('testPlayer', testGames[0]._id);
        expect(readFileSyncSpy).toBeCalled();
        expect(parseSpy).toBeCalled();
        expect(buildClientGameVersionSpy).toBeCalled();
        expect(generateRoomIdSpy).toBeCalled();
    });

    it('createOneVsOneGame should call createRoom and create 1v1 room', async () => {
        const createRoomSpy = jest.spyOn(service, 'createRoom').mockImplementation(async () => Promise.resolve(fakeRoom));
        const result = await service.createOneVsOneGame('testPlayer', testGames[0]._id);
        expect(createRoomSpy).toBeCalled();
        expect(result).toEqual(fakeRoom);
    });

    it('updateTimer() should update the timer', () => {
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameEvents.TimerStarted);
            },
        } as BroadcastOperator<unknown, unknown>);
        const toSpy = jest.spyOn(server, 'to');
        service.updateTimer(fakeRoom.roomId, server);
        expect(service['rooms'].get(fakeRoom.roomId).timer).toEqual(1);
        expect(toSpy).toBeCalledWith(fakeRoom.roomId);
    });

    it('getRoomIdFromSocket() should call from and values', () => {
        stub(socket, 'rooms').value(new Set(['fakeRoomId']));
        const valuesSpy = jest.spyOn(socket.rooms, 'values');
        const fromSpy = jest.spyOn(Array, 'from');
        service.getRoomIdFromSocket(socket);
        expect(fromSpy).toBeCalled();
        expect(valuesSpy).toBeCalled();
    });

    it('verifyCoords should emit the removeDiff event with coord if the coordinates are correct', () => {
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        const getRoomIdFromSocketSpy = jest.spyOn(service, 'getRoomIdFromSocket').mockReturnValue(fakeRoom.roomId);
        let localMessageEmitted = false;
        let removeDiffEmitted = false;

        server.to.returns({
            emit: (event: string) => {
                if (event === MessageEvents.LocalMessage && !localMessageEmitted) {
                    expect(event).toEqual(MessageEvents.LocalMessage);
                    localMessageEmitted = true;
                } else if (event === GameEvents.RemoveDiff && !removeDiffEmitted) {
                    expect(event).toEqual(GameEvents.RemoveDiff);
                    removeDiffEmitted = true;
                }
            },
        } as BroadcastOperator<unknown, unknown>);
        const toSpy = jest.spyOn(server, 'to');

        service.verifyCoords(socket, { x: 0, y: 0 }, server);
        expect(toSpy).toBeCalledWith(fakeRoom.roomId);
        expect(getRoomIdFromSocketSpy).toBeCalled();
    });

    it('verifyCoords should emit the removeDiff event with empty currentDifference if the coordinates are not correct', () => {
        fakeRoom.player1.playerId = 'testPlayer';
        fakeRoom.player2 = {
            playerId: 'testPlayer',
            name: 'testPlayer',
            diffData,
        };
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        const getRoomIdFromSocketSpy = jest.spyOn(service, 'getRoomIdFromSocket').mockReturnValue(fakeRoom.roomId);
        let localMessageEmitted = false;
        let removeDiffEmitted = false;
        server.to.returns({
            emit: (event: string) => {
                if (event === MessageEvents.LocalMessage && !localMessageEmitted) {
                    expect(event).toEqual(MessageEvents.LocalMessage);
                    localMessageEmitted = true;
                } else if (event === GameEvents.RemoveDiff && !removeDiffEmitted) {
                    expect(event).toEqual(GameEvents.RemoveDiff);
                    removeDiffEmitted = true;
                }
            },
        } as BroadcastOperator<unknown, unknown>);
        const toSpy = jest.spyOn(server, 'to');
        service.verifyCoords(socket, { x: 1, y: 0 }, server);
        expect(toSpy).toBeCalledWith(fakeRoom.roomId);
        expect(getRoomIdFromSocketSpy).toBeCalled();
    });

    it('verifyCoords should return noting if room undefine', () => {
        const getRoomIdFromSocketSpy = jest.spyOn(service, 'getRoomIdFromSocket').mockReturnValue(undefined);
        service.verifyCoords(socket, { x: 1, y: 0 }, server);
        expect(getRoomIdFromSocketSpy).toBeCalled();
    });

    it('buildClientGameVersion() should return a ClientSideGame', () => {
        jest.spyOn(fs, 'readFileSync').mockReturnValue('test');
        const result = service.buildClientGameVersion(testGames[0]);
        result.mode = GameModes.ClassicOneVsOne;
        expect(result).toEqual(clientSideGame);
    });

    it('deleteOneVsOneRoomAvailability should call updateRoomOneVsOneAvailability', () => {
        const updateRoomOneVsOneAvailabilitySpy = jest.spyOn(service, 'updateRoomOneVsOneAvailability');
        service.deleteOneVsOneRoomAvailability('fakeRoomId', server);
        expect(updateRoomOneVsOneAvailabilitySpy).toBeCalled();
    });

    it('endGame() should emit the end game event in ClassicSolo case ', () => {
        fakeRoom2.clientGame.mode = GameModes.ClassicSolo;
        fakeRoom2.player1.playerId = '0';
        const getRoomIdFromSocketSpy = jest.spyOn(service, 'getRoomIdFromSocket').mockReturnValue(fakeRoom2.roomId);
        const getRoomByRoomIdSpy = jest.spyOn(service, 'getRoomByRoomId').mockReturnValue(fakeRoom2);
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameEvents.EndGame);
            },
        } as BroadcastOperator<unknown, unknown>);
        service.endGame(socket, server);
        expect(getRoomIdFromSocketSpy).toBeCalled();
        expect(getRoomByRoomIdSpy).toBeCalled();
    });

    it('endGame() should not emit the end game event', () => {
        fakeRoom2.player1.playerId = undefined;
        const getRoomIdFromSocketSpy = jest.spyOn(service, 'getRoomIdFromSocket').mockReturnValue(fakeRoom.roomId);
        const getRoomByRoomIdSpy = jest.spyOn(service, 'getRoomByRoomId').mockReturnValue(undefined);
        service.endGame(socket, server);
        expect(getRoomByRoomIdSpy).toBeCalled();
        expect(getRoomIdFromSocketSpy).toBeCalled();
    });

    it('endGame() should emit the end game event in ClassicSolo case ', () => {
        fakeRoom2.clientGame.mode = GameModes.ClassicOneVsOne;
        fakeRoom2.clientGame.differencesCount = 4;
        fakeRoom2.player2.diffData.differencesFound = 2;
        const getRoomIdFromSocketSpy = jest.spyOn(service, 'getRoomIdFromSocket').mockReturnValue(fakeRoom2.roomId);
        const getRoomByRoomIdSpy = jest.spyOn(service, 'getRoomByRoomId').mockReturnValue(fakeRoom2);
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameEvents.EndGame);
            },
        } as BroadcastOperator<unknown, unknown>);
        service.endGame(socket, server);
        expect(getRoomIdFromSocketSpy).toBeCalled();
        expect(getRoomByRoomIdSpy).toBeCalled();
    });

    it('getRoomByRoomId() should return the room', () => {
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        const result = service.getRoomByRoomId(fakeRoom.roomId);
        expect(result).toEqual(fakeRoom);
    });

    it('getRoomByRoomId() should return undefined', () => {
        const result = service.getRoomByRoomId(fakeRoom.roomId);
        expect(result).toBeUndefined();
    });

    it('updateRoomOneVsOneAvailability() should emit the RoomOneVsOneAvailable event', () => {
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameEvents.RoomOneVsOneAvailable);
            },
        } as BroadcastOperator<unknown, unknown>);
        service.updateRoomOneVsOneAvailability(fakeRoom.roomId, server);
    });

    it('checkRoomOneVsOneAvailability() should emit availabilityData the RoomOneVsOneAvailable event (false case)', () => {
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameEvents.RoomOneVsOneAvailable);
            },
        } as BroadcastOperator<unknown, unknown>);
        service.checkRoomOneVsOneAvailability(fakeRoom.roomId, server);
    });

    it('checkRoomOneVsOneAvailability() should emit availabilityData the RoomOneVsOneAvailable event (true case)', () => {
        service['roomAvailability'].set(fakeRoom.roomId, { gameId: fakeRoom.clientGame.id, isAvailableToJoin: true });
        const hasSpy = jest.spyOn(service['roomAvailability'], 'has').mockReturnValue(true);
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameEvents.RoomOneVsOneAvailable);
            },
        } as BroadcastOperator<unknown, unknown>);
        service.checkRoomOneVsOneAvailability(fakeRoom.roomId, server);
        expect(hasSpy).toBeCalled();
    });

    it('createOneVsOneRoom() should return a room', async () => {
        const generateRoomIdSpy = jest.spyOn(service as any, 'generateRoomId').mockImplementation(() => 'fakeRoomId');
        const createOneVsOneGameSpy = jest.spyOn(service, 'createOneVsOneGame').mockResolvedValue(fakeRoom);
        const result = await service.createOneVsOneRoom(fakeRoom.clientGame.id);
        expect(result).toEqual(fakeRoom);
        expect(createOneVsOneGameSpy).toBeCalled();
        expect(generateRoomIdSpy).toBeCalled();
    });

    it('getOneVsOneRoomByGameId() should return a room', () => {
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        const fromSpy = jest.spyOn(Array, 'from');
        service.getOneVsOneRoomByGameId(fakeRoom.clientGame.id);
        expect(fromSpy).toBeCalled();
    });

    it('saveRoom() should save the room', () => {
        service.saveRoom(fakeRoom);
        expect(service['rooms'].get(fakeRoom.roomId)).toEqual(fakeRoom);
    });

    it('updateWaitingPlayerNameList should add the player to joinedPlayerNamesByGameId', () => {
        service['joinedPlayerNamesByGameId'].set(fakeRoom.clientGame.id, []);
        const pushSpy = jest.spyOn(service['joinedPlayerNamesByGameId'].get(fakeRoom.clientGame.id), 'push');
        service.updateWaitingPlayerNameList(fakeRoom.clientGame.id, fakeRoom.player1.name, socket);
        expect(pushSpy).toBeCalled();
    });

    it('updateWaitingPlayerNameList should add the player to joinedPlayerNamesByGameId (get return undefine)', () => {
        const getSpy = jest.spyOn(service['joinedPlayerNamesByGameId'], 'get').mockReturnValue(undefined);
        service.updateWaitingPlayerNameList(fakeRoom.clientGame.id, fakeRoom.player1.name, socket);
        expect(getSpy).toBeCalled();
    });

    it('getWaitingPlayerNameList should return the list of player names', () => {
        service['joinedPlayerNamesByGameId'].set(fakeRoom.clientGame.id, [fakeRoom.player1]);
        const fromSpy = jest.spyOn(Array, 'from');
        service.getWaitingPlayerNameList(fakeRoom.clientGame.id);
        expect(fromSpy).toBeCalled();
    });

    it('getWaitingPlayerNameList should return the list of player names (has return false)', () => {
        const getSpy = jest.spyOn(service['joinedPlayerNamesByGameId'], 'get').mockReturnValue(undefined);
        const fromSpy = jest.spyOn(Array, 'from');
        service.getWaitingPlayerNameList(fakeRoom.clientGame.id);
        expect(fromSpy).toBeCalled();
        expect(getSpy).toBeCalled();
    });

    it('refusePlayer() should call cancelJoining and emit the RefusePlayer event', () => {
        const cancelJoiningSpy = jest.spyOn(service, 'cancelJoining');
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameEvents.RefusePlayer);
            },
        } as BroadcastOperator<unknown, unknown>);
        service.refusePlayer('0', 'fake', server);
        expect(cancelJoiningSpy).toBeCalled();
    });

    it('acceptPlayer should return accept player name', () => {
        const getSpy = jest.spyOn(service['rooms'], 'get').mockReturnValue(fakeRoom);
        service['joinedPlayerNamesByGameId'].set(fakeRoom.clientGame.id, [fakePlayer]);
        const result = service.acceptPlayer(fakeRoom.clientGame.id, fakeRoom.roomId, fakePlayer.name);
        expect(result).toEqual(fakePlayer.name);
        expect(getSpy).toBeCalled();
    });

    it('acceptPlayer should return undefined in case room undefined', () => {
        const getSpy = jest.spyOn(service['rooms'], 'get').mockReturnValue(undefined);
        const result = service.acceptPlayer(fakeRoom.clientGame.id, fakeRoom.roomId, fakePlayer.name);
        expect(result).toBeUndefined();
        expect(getSpy).toBeCalled();
    });

    it('acceptPlayer should return undefined in case acceptedPlayer undefined', () => {
        const getSpy = jest.spyOn(service['rooms'], 'get').mockReturnValue(fakeRoom);
        const joinedPlayerNamesByGameIdGetSpy = jest.spyOn(service['joinedPlayerNamesByGameId'], 'get').mockReturnValue(undefined);
        const result = service.acceptPlayer(fakeRoom.clientGame.id, fakeRoom.roomId, fakePlayer.name);
        expect(result).toBeUndefined();
        expect(getSpy).toBeCalled();
        expect(joinedPlayerNamesByGameIdGetSpy).toBeCalled();
    });

    it('checkIfPlayerNameIsAvailable should emit on PlayerNameTaken event', () => {
        service['joinedPlayerNamesByGameId'].set(fakeRoom.clientGame.id, [fakePlayer]);
        const someSpy = jest.spyOn(Array.prototype, 'some');
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameEvents.PlayerNameTaken);
            },
        } as BroadcastOperator<unknown, unknown>);
        service.checkIfPlayerNameIsAvailable(fakeRoom.clientGame.id, fakePlayer.name, server);
        expect(someSpy).toBeCalled();
    });

    it('checkIfPlayerNameIsAvailable should emit on PlayerNameTaken event (get return false)', () => {
        const joinedPlayerNamesByGameIdGetSpy = jest.spyOn(service['joinedPlayerNamesByGameId'], 'get').mockReturnValue(undefined);
        const someSpy = jest.spyOn(Array.prototype, 'some');
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameEvents.PlayerNameTaken);
            },
        } as BroadcastOperator<unknown, unknown>);
        service.checkIfPlayerNameIsAvailable(fakeRoom.clientGame.id, fakePlayer.name, server);
        expect(someSpy).toBeCalled();
        expect(joinedPlayerNamesByGameIdGetSpy).toBeCalled();
    });

    it('cancelJoining should remove the player from joinedPlayerNamesByGameId and emit on UpdateWaitingPlayerNameList event', () => {
        const mapSpy = jest.spyOn(Array.prototype, 'map');
        service['joinedPlayerNamesByGameId'].set(fakeRoom.clientGame.id, [fakePlayer, fakePlayer2]);
        const spliceSpy = jest.spyOn(service['joinedPlayerNamesByGameId'].get(fakeRoom.clientGame.id), 'splice');
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameEvents.UpdateWaitingPlayerNameList);
            },
        } as BroadcastOperator<unknown, unknown>);
        service.cancelJoining(fakeRoom.clientGame.id, fakePlayer.name, server);
        expect(spliceSpy).toBeCalled();
        expect(mapSpy).toBeCalled();
    });

    it('cancelAllJoining should remove all players from joinedPlayerNamesByGameId and emit on UpdateWaitingPlayerNameList event', () => {
        service['joinedPlayerNamesByGameId'].set(fakeRoom.clientGame.id, [fakePlayer]);
        const cancelJoiningSpy = jest.spyOn(service, 'cancelJoining');
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameEvents.UpdateWaitingPlayerNameList);
            },
        } as BroadcastOperator<unknown, unknown>);
        service.cancelAllJoining(fakeRoom.clientGame.id, server);
        expect(cancelJoiningSpy).toBeCalled();
    });

    it('getGameIdByPlayerId should return the game id', () => {
        service['joinedPlayerNamesByGameId'].set(fakeRoom.clientGame.id, [fakePlayer]);
        const result = service.getGameIdByPlayerId(fakePlayer.playerId);
        expect(result).toEqual(fakeRoom.clientGame.id);
    });

    it('getRoomIdByPlayerId should return the room id (player1 case)', () => {
        fakeRoom.player2 = fakePlayer;
        fakeRoom.player2.playerId = undefined;
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        const findSpy = jest.spyOn(Array.prototype, 'find');
        const result = service.getRoomIdByPlayerId(fakePlayer.playerId);
        expect(result).toEqual(fakeRoom.roomId);
        expect(findSpy).toBeCalled();
    });

    it('getRoomIdByPlayerId should return the room id (player2 case)', () => {
        fakeRoom.player1 = undefined;
        fakeRoom.player2 = fakePlayer;
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        const findSpy = jest.spyOn(Array.prototype, 'find');
        const result = service.getRoomIdByPlayerId(fakePlayer.playerId);
        expect(result).toEqual(fakeRoom.roomId);
        expect(findSpy).toBeCalled();
        fakeRoom.player1 = fakePlayer;
    });
    it('getRoomIdByPlayerId should return the room id (fake playerId case) ', () => {
        fakeRoom.player2 = undefined;
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        const findSpy = jest.spyOn(Array.prototype, 'find');
        const result = service.getRoomIdByPlayerId('0');
        expect(findSpy).toBeCalled();
        expect(result).toBeUndefined();
        fakeRoom.player2 = fakePlayer;
    });
    it('deleteJoinedPlayerById should delete the player from joinedPlayerNamesByGameId and emit on UpdateWaitingPlayerNameList event ', () => {
        service['joinedPlayerNamesByGameId'].set(fakeRoom.clientGame.id, [fakePlayer, fakePlayer2]);
        const getGameIdByPlayerIdSpy = jest.spyOn(service, 'getGameIdByPlayerId').mockReturnValue(fakeRoom.clientGame.id);
        const spliceSpy = jest.spyOn(service['joinedPlayerNamesByGameId'].get(fakeRoom.clientGame.id), 'splice');
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameEvents.UpdateWaitingPlayerNameList);
            },
        } as BroadcastOperator<unknown, unknown>);
        service.deleteJoinedPlayerById(fakePlayer.playerId, server);
        expect(spliceSpy).toBeCalled();
        expect(getGameIdByPlayerIdSpy).toBeCalled();
    });

    it('deleteJoinedPlayerById should not delete the player from joinedPlayerNamesByGameId  ', () => {
        service['joinedPlayerNamesByGameId'].set(fakeRoom.clientGame.id, [fakePlayer]);
        const getGameIdByPlayerIdSpy = jest.spyOn(service, 'getGameIdByPlayerId').mockReturnValue(undefined);
        const spliceSpy = jest.spyOn(service['joinedPlayerNamesByGameId'].get(fakeRoom.clientGame.id), 'splice');
        service.deleteJoinedPlayerById(fakePlayer.playerId, server);
        expect(spliceSpy).not.toBeCalled();
        expect(getGameIdByPlayerIdSpy).toBeCalled();
    });

    it('deleteJoinedPlayerById should not delete the player from joinedPlayerNamesByGameId  ', () => {
        service['joinedPlayerNamesByGameId'].set(fakeRoom.clientGame.id, [fakePlayer]);
        const findIndexSpy = jest.spyOn(Array.prototype, 'findIndex').mockReturnValue(-1);
        const getGameIdByPlayerIdSpy = jest.spyOn(service, 'getGameIdByPlayerId').mockReturnValue(fakeRoom.clientGame.id);
        const spliceSpy = jest.spyOn(service['joinedPlayerNamesByGameId'].get(fakeRoom.clientGame.id), 'splice');
        service.deleteJoinedPlayerById(fakePlayer.playerId, server);
        expect(spliceSpy).not.toBeCalled();
        expect(getGameIdByPlayerIdSpy).toBeCalled();
        expect(findIndexSpy).toBeCalled();
    });

    it('abandonGame should delete the room ,roomAvailability and emit on EndGame event (player1 case)', () => {
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        const getRoomIdByPlayerIdSpy = jest.spyOn(service, 'getRoomIdByPlayerId').mockReturnValue(fakeRoom.roomId);
        const getRoomByRoomIdSpy = jest.spyOn(service, 'getRoomByRoomId').mockReturnValue(fakeRoom);
        const deleteRoomSpy = jest.spyOn(service, 'deleteCreatedRoom');
        const deleteRoomAvailabilitySpy = jest.spyOn(service, 'deleteOneVsOneRoomAvailability');
        server.to.returns({
            emit: (event: string) => {
                if (event === GameEvents.EndGame) {
                    expect(event).toEqual(GameEvents.EndGame);
                } else {
                    expect(event).toEqual(MessageEvents.LocalMessage);
                }
            },
        } as BroadcastOperator<unknown, unknown>);
        service.abandonGame(socket, server);
        expect(getRoomIdByPlayerIdSpy).toBeCalled();
        expect(getRoomByRoomIdSpy).toBeCalled();
        expect(deleteRoomSpy).toBeCalled();
        expect(deleteRoomAvailabilitySpy).toBeCalled();
    });

    it('abandonGame should delete the room ,roomAvailability and emit on EndGame event (player2 case)', () => {
        fakeRoom.player1.playerId = '0';
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        const getRoomIdByPlayerIdSpy = jest.spyOn(service, 'getRoomIdByPlayerId').mockReturnValue(fakeRoom.roomId);
        const getRoomByRoomIdSpy = jest.spyOn(service, 'getRoomByRoomId').mockReturnValue(fakeRoom);
        const deleteRoomSpy = jest.spyOn(service, 'deleteCreatedRoom');
        const deleteRoomAvailabilitySpy = jest.spyOn(service, 'deleteOneVsOneRoomAvailability');
        server.to.returns({
            emit: (event: string) => {
                if (event === GameEvents.EndGame) {
                    expect(event).toEqual(GameEvents.EndGame);
                } else {
                    expect(event).toEqual(MessageEvents.LocalMessage);
                }
            },
        } as BroadcastOperator<unknown, unknown>);
        service.abandonGame(socket, server);
        expect(getRoomIdByPlayerIdSpy).toBeCalled();
        expect(getRoomByRoomIdSpy).toBeCalled();
        expect(deleteRoomSpy).toBeCalled();
        expect(deleteRoomAvailabilitySpy).toBeCalled();
    });

    it('handleSocketDisconnect should delete the player from joinedPlayerNamesByGameId and emit on UpdateWaitingPlayerNameList event', () => {
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        service['joinedPlayerNamesByGameId'].set(fakeRoom.clientGame.id, [fakePlayer]);
        const getGameIdByPlayerIdSpy = jest.spyOn(service, 'getRoomIdByPlayerId').mockReturnValue(fakeRoom.roomId);
        const getRoomByRoomIdSpy = jest.spyOn(service, 'getRoomByRoomId').mockReturnValue(fakeRoom);
        const abandonGameSpy = jest.spyOn(service, 'abandonGame');
        server.to.returns({
            emit: (event: string) => {
                if (event === GameEvents.EndGame) {
                    expect(event).toEqual(GameEvents.EndGame);
                } else {
                    expect(event).toEqual(MessageEvents.LocalMessage);
                }
            },
        } as BroadcastOperator<unknown, unknown>);
        service.handleSocketDisconnect(socket, server);
        expect(getGameIdByPlayerIdSpy).toBeCalled();
        expect(getRoomByRoomIdSpy).toBeCalled();
        expect(abandonGameSpy).toBeCalled();
    });

    it('handleSocketDisconnect should call abandonGame ', () => {
        fakeRoom.clientGame.mode = GameModes.ClassicOneVsOne;
        fakeRoom.player1 = fakePlayer;
        service['rooms'].set(fakeRoom.roomId, undefined);
        const getGameIdByPlayerIdSpy = jest.spyOn(service, 'getRoomIdByPlayerId').mockReturnValue(fakeRoom.roomId);
        const getRoomByRoomIdSpy = jest.spyOn(service, 'getRoomByRoomId');
        const getSpy = jest.spyOn(service['roomAvailability'], 'get').mockReturnValue({
            gameId: fakeRoom.clientGame.id,
            isAvailableToJoin: true,
        });
        const deleteJoinedPlayerByIdSpy = jest.spyOn(service, 'deleteJoinedPlayerById');
        service.handleSocketDisconnect(socket, server);
        expect(getGameIdByPlayerIdSpy).toBeCalled();
        expect(getRoomByRoomIdSpy).toBeCalled();
        expect(getSpy).toBeCalled();
        expect(deleteJoinedPlayerByIdSpy).toBeCalled();
    });

    it('handleSocketDisconnect should call deleteOneVsOneRoomAvailability and cancelAllJoining ', () => {
        fakeRoom.clientGame.mode = GameModes.ClassicOneVsOne;
        fakeRoom.timer = 0;
        fakeRoom.player1 = fakePlayer;
        fakeRoom.player2 = undefined;
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        const getGameIdByPlayerIdSpy = jest.spyOn(service, 'getRoomIdByPlayerId').mockReturnValue(fakeRoom.roomId);
        const getRoomByRoomIdSpy = jest.spyOn(service, 'getRoomByRoomId');
        const getSpy = jest.spyOn(service['roomAvailability'], 'get').mockReturnValue({
            gameId: fakeRoom.clientGame.id,
            isAvailableToJoin: true,
        });
        const deleteOneVsOneRoomAvailabilitySpy = jest.spyOn(service, 'deleteOneVsOneRoomAvailability');
        const cancelAllJoiningSpy = jest.spyOn(service, 'cancelAllJoining');
        service.handleSocketDisconnect(socket, server);
        expect(getGameIdByPlayerIdSpy).toBeCalled();
        expect(getRoomByRoomIdSpy).toBeCalled();
        expect(getSpy).toBeCalled();
        expect(deleteOneVsOneRoomAvailabilitySpy).toBeCalled();
        expect(cancelAllJoiningSpy).toBeCalled();
    });

    it('generateRoomId should return a string of length 6', () => {
        const roomId = service['generateRoomId']();
        expect(roomId.length).toEqual(36);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
