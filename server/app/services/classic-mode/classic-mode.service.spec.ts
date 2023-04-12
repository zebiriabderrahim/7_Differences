// for -1 index test
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-lines */
// for any test
/* eslint-disable @typescript-eslint/no-explicit-any */
// for id test
/* eslint-disable no-underscore-dangle */
// import { Game } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';
import { MessageManagerService } from '@app/services/message-manager/message-manager.service';
// import { Coordinate } from '@common/coordinate';
// import { ClassicPlayRoom, ClientSideGame, Differences, Player } from '@common/game-interfaces';
import { Test, TestingModule } from '@nestjs/testing';
// import * as fs from 'fs';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
// import { BroadcastOperator, Server, Socket } from 'socket.io';
import { PlayersListManagerService } from '@app/services/players-list-manager/players-list-manager.service';
import { ClassicModeService } from './classic-mode.service';
import { RoomsManagerService } from '@app/services/rooms-manager/rooms-manager.service';

describe('ClassicModeService', () => {
    let service: ClassicModeService;
    let messageManagerService: SinonStubbedInstance<MessageManagerService>;
    let gameService: SinonStubbedInstance<GameService>;
    let playersListManagerService: SinonStubbedInstance<PlayersListManagerService>;
    let roomsManagerService: SinonStubbedInstance<RoomsManagerService>;
    // let socket: SinonStubbedInstance<Socket>;
    // let server: SinonStubbedInstance<Server>;

    // const clientSideGame: ClientSideGame = {
    //     id: '1',
    //     name: 'test',
    //     isHard: true,
    //     original: 'data:image/png;base64,test',
    //     modified: 'data:image/png;base64,test',
    //     differencesCount: 1,
    //     mode: '',
    // };
    // const differenceData: Differences = {
    //     currentDifference: [],
    //     differencesFound: 0,
    // };
    // const testGames: Game[] = [
    //     {
    //         _id: '1',
    //         name: 'test',
    //         isHard: true,
    //         originalImage: 'test',
    //         modifiedImage: 'test',
    //         nDifference: 1,
    //         differences: 'test',
    //     },
    // ];

    // const fakeDiff: Differences = {
    //     currentDifference: [],
    //     differencesFound: 0,
    // };
    // const fakePlayer: Player = {
    //     playerId: 'testPlayer',
    //     name: 'testPlayer',
    //     differenceData: fakeDiff,
    // };

    // const fakeRoom: ClassicPlayRoom = {
    //     roomId: 'fakeRoomId',
    //     originalDifferences: [[{ x: 0, y: 0 } as Coordinate]],
    //     clientGame: clientSideGame,
    //     timer: 0,
    //     endMessage: '',
    // };

    // const fakePlayer2: Player = {
    //     playerId: 'testPlayer2',
    //     name: 'testPlayer2',
    //     differenceData: { currentDifference: [], differencesFound: 1 },
    // };

    // const fakeRoom2: ClassicPlayRoom = {
    //     roomId: 'fakeRoomId2',
    //     originalDifferences: [[{ x: 0, y: 0 } as Coordinate]],
    //     clientGame: clientSideGame,
    //     timer: 0,
    //     endMessage: '',
    //     player1: fakePlayer2,
    //     player2: fakePlayer2,
    // };

    beforeEach(async () => {
        gameService = createStubInstance(GameService);
        messageManagerService = createStubInstance(MessageManagerService);
        playersListManagerService = createStubInstance(PlayersListManagerService);
        roomsManagerService = createStubInstance(RoomsManagerService);
        // socket = createStubInstance<Socket>(Socket);
        // server = createStubInstance<Server>(Server);
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
            ],
        }).compile();

        service = module.get<ClassicModeService>(ClassicModeService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // it('createRoom() should create a new classic room', async () => {
    //     const generateRoomIdSpy = jest.spyOn(service as any, 'generateRoomId').mockImplementation(() => 'fakeRoomId');
    //     const readFileSyncSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue('test');
    //     const parseSpy = jest.spyOn(JSON, 'parse').mockReturnValue([[{ x: 0, y: 0 } as Coordinate]]);
    //     gameService.getGameById.resolves(testGames[0]);
    //     const buildClientGameVersionSpy = jest.spyOn(service, 'buildClientGameVersion');
    //     await service.createRoom('testPlayer', testGames[0]._id);
    //     expect(readFileSyncSpy).toBeCalled();
    //     expect(parseSpy).toBeCalled();
    //     expect(buildClientGameVersionSpy).toBeCalled();
    //     expect(generateRoomIdSpy).toBeCalled();
    // });

    // it('updateTimer() should update the timer', () => {
    //     service['rooms'].set(fakeRoom.roomId, fakeRoom);
    //     server.to.returns({
    //         emit: (event: string) => {
    //             expect(event).toEqual(GameEvents.TimerStarted);
    //         },
    //     } as BroadcastOperator<unknown, unknown>);
    //     const toSpy = jest.spyOn(server, 'to');
    //     service.updateTimer(fakeRoom.roomId, server);
    //     expect(service['rooms'].get(fakeRoom.roomId).timer).toEqual(1);
    //     expect(toSpy).toBeCalledWith(fakeRoom.roomId);
    // });

    // it('getRoomIdFromSocket() should call from and values', () => {
    //     stub(socket, 'rooms').value(new Set(['fakeRoomId']));
    //     const valuesSpy = jest.spyOn(socket.rooms, 'values');
    //     const fromSpy = jest.spyOn(Array, 'from');
    //     service.getRoomIdFromSocket(socket);
    //     expect(fromSpy).toBeCalled();
    //     expect(valuesSpy).toBeCalled();
    // });

    // it('verifyCoords should emit the removeDifference event with coord if the coordinates are correct', () => {
    //     service['rooms'].set(fakeRoom.roomId, fakeRoom);
    //     const getRoomIdFromSocketSpy = jest.spyOn(service, 'getRoomIdFromSocket').mockReturnValue(fakeRoom.roomId);
    //     let localMessageEmitted = false;
    //     let removeDifferenceEmitted = false;

    //     server.to.returns({
    //         emit: (event: string) => {
    //             if (event === MessageEvents.LocalMessage && !localMessageEmitted) {
    //                 expect(event).toEqual(MessageEvents.LocalMessage);
    //                 localMessageEmitted = true;
    //             } else if (event === GameEvents.RemoveDifference && !removeDifferenceEmitted) {
    //                 expect(event).toEqual(GameEvents.RemoveDifference);
    //                 removeDifferenceEmitted = true;
    //             }
    //         },
    //     } as BroadcastOperator<unknown, unknown>);
    //     const toSpy = jest.spyOn(server, 'to');

    //     service.verifyCoords(socket, { x: 0, y: 0 }, server);
    //     expect(toSpy).toBeCalledWith(fakeRoom.roomId);
    //     expect(getRoomIdFromSocketSpy).toBeCalled();
    // });

    // it('verifyCoords should emit the removeDiff event with empty currentDifference if the coordinates are not correct', () => {
    //     fakeRoom.player1.playerId = 'testPlayer';
    //     fakeRoom.player2 = {
    //         playerId: 'testPlayer',
    //         name: 'testPlayer',
    //         differenceData,
    //     };
    //     service['rooms'].set(fakeRoom.roomId, fakeRoom);
    //     const getRoomIdFromSocketSpy = jest.spyOn(service, 'getRoomIdFromSocket').mockReturnValue(fakeRoom.roomId);
    //     let localMessageEmitted = false;
    //     let removeDiffEmitted = false;
    //     server.to.returns({
    //         emit: (event: string) => {
    //             if (event === MessageEvents.LocalMessage && !localMessageEmitted) {
    //                 expect(event).toEqual(MessageEvents.LocalMessage);
    //                 localMessageEmitted = true;
    //             } else if (event === GameEvents.RemoveDifference && !removeDifferenceEmitted) {
    //                 expect(event).toEqual(GameEvents.RemoveDifference);
    //                 removeDifferenceEmitted = true;
    //             }
    //         },
    //     } as BroadcastOperator<unknown, unknown>);
    //     const toSpy = jest.spyOn(server, 'to');
    //     service.verifyCoords(socket, { x: 1, y: 0 }, server);
    //     expect(toSpy).toBeCalledWith(fakeRoom.roomId);
    //     expect(getRoomIdFromSocketSpy).toBeCalled();
    // });

    // it('verifyCoords should return noting if room undefine', () => {
    //     const getRoomIdFromSocketSpy = jest.spyOn(service, 'getRoomIdFromSocket').mockReturnValue(undefined);
    //     service.verifyCoords(socket, { x: 1, y: 0 }, server);
    //     expect(getRoomIdFromSocketSpy).toBeCalled();
    // });

    // it('buildClientGameVersion() should return a ClientSideGame', () => {
    //     jest.spyOn(fs, 'readFileSync').mockReturnValue('test');
    //     const result = service.buildClientGameVersion(testGames[0]);
    //     result.mode = GameModes.ClassicOneVsOne;
    //     expect(result).toEqual(clientSideGame);
    // });

    // it('getRoomByRoomId() should return the room', () => {
    //     service['rooms'].set(fakeRoom.roomId, fakeRoom);
    //     const result = service.getRoomById(fakeRoom.roomId);
    //     expect(result).toEqual(fakeRoom);
    // });

    // it('getRoomByRoomId() should return undefined', () => {
    //     const result = service.getRoomById(fakeRoom.roomId);
    //     expect(result).toBeUndefined();
    // });

    // it('getOneVsOneRoomByGameId() should return a room', () => {
    //     service['rooms'].set(fakeRoom.roomId, fakeRoom);
    //     const fromSpy = jest.spyOn(Array, 'from');
    //     service.getOneVsOneRoomByGameId(fakeRoom.clientGame.id);
    //     expect(fromSpy).toBeCalled();
    // });

    // it('saveRoom() should save the room', () => {
    //     service.saveRoom(fakeRoom);
    //     expect(service['rooms'].get(fakeRoom.roomId)).toEqual(fakeRoom);
    // });

    // it('getRoomIdByPlayerId should return the room id (player1 case)', () => {
    //     fakeRoom.player2 = fakePlayer;
    //     fakeRoom.player2.playerId = undefined;
    //     service['rooms'].set(fakeRoom.roomId, fakeRoom);
    //     const findSpy = jest.spyOn(Array.prototype, 'find');
    //     const result = service.getRoomIdByPlayerId(fakePlayer.playerId);
    //     expect(result).toEqual(fakeRoom.roomId);
    //     expect(findSpy).toBeCalled();
    // });

    // it('getRoomIdByPlayerId should return the room id (player2 case)', () => {
    //     fakeRoom.player1 = undefined;
    //     fakeRoom.player2 = fakePlayer;
    //     service['rooms'].set(fakeRoom.roomId, fakeRoom);
    //     const findSpy = jest.spyOn(Array.prototype, 'find');
    //     const result = service.getRoomIdByPlayerId(fakePlayer.playerId);
    //     expect(result).toEqual(fakeRoom.roomId);
    //     expect(findSpy).toBeCalled();
    //     fakeRoom.player1 = fakePlayer;
    // });
    // it('getRoomIdByPlayerId should return the room id (fake playerId case) ', () => {
    //     fakeRoom.player2 = undefined;
    //     service['rooms'].set(fakeRoom.roomId, fakeRoom);
    //     const findSpy = jest.spyOn(Array.prototype, 'find');
    //     const result = service.getRoomIdByPlayerId('0');
    //     expect(findSpy).toBeCalled();
    //     expect(result).toBeUndefined();
    //     fakeRoom.player2 = fakePlayer;
    // });

    // // it('handleSocketDisconnect should call abandonGame ', () => {
    // //     fakeRoom.clientGame.mode = GameModes.ClassicOneVsOne;
    // //     fakeRoom.player1 = fakePlayer;
    // //     service['rooms'].set(fakeRoom.roomId, undefined);
    // //     const getGameIdByPlayerIdSpy = jest.spyOn(service, 'getRoomIdByPlayerId').mockReturnValue(fakeRoom.roomId);
    // //     const getRoomByRoomIdSpy = jest.spyOn(service, 'getRoomByRoomId');
    // //     const getSpy = jest.spyOn(service['roomAvailability'], 'get').mockReturnValue({
    // //         gameId: fakeRoom.clientGame.id,
    // //         isAvailableToJoin: true,
    // //     });
    // //     const deleteJoinedPlayerByIdSpy = jest.spyOn(service, 'deleteJoinedPlayerById');
    // //     service.handleSocketDisconnect(socket, server);
    // //     expect(getGameIdByPlayerIdSpy).toBeCalled();
    // //     expect(getRoomByRoomIdSpy).toBeCalled();
    // //     expect(getSpy).toBeCalled();
    // //     expect(deleteJoinedPlayerByIdSpy).toBeCalled();
    // // });

    // // it('handleSocketDisconnect should call deleteOneVsOneRoomAvailability and cancelAllJoining ', () => {
    // //     fakeRoom.clientGame.mode = GameModes.ClassicOneVsOne;
    // //     fakeRoom.timer = 0;
    // //     fakeRoom.player1 = fakePlayer;
    // //     fakeRoom.player2 = undefined;
    // //     service['rooms'].set(fakeRoom.roomId, fakeRoom);
    // //     const getGameIdByPlayerIdSpy = jest.spyOn(service, 'getRoomIdByPlayerId').mockReturnValue(fakeRoom.roomId);
    // //     const getRoomByRoomIdSpy = jest.spyOn(service, 'getRoomByRoomId');
    // //     const getSpy = jest.spyOn(service['roomAvailability'], 'get').mockReturnValue({
    // //         gameId: fakeRoom.clientGame.id,
    // //         isAvailableToJoin: true,
    // //     });
    // //     const deleteOneVsOneRoomAvailabilitySpy = jest.spyOn(service, 'deleteOneVsOneRoomAvailability');
    // //     const cancelAllJoiningSpy = jest.spyOn(service, 'cancelAllJoining');
    // //     service.handleSocketDisconnect(socket, server);
    // //     expect(getGameIdByPlayerIdSpy).toBeCalled();
    // //     expect(getRoomByRoomIdSpy).toBeCalled();
    // //     expect(getSpy).toBeCalled();
    // //     expect(deleteOneVsOneRoomAvailabilitySpy).toBeCalled();
    // //     expect(cancelAllJoiningSpy).toBeCalled();
    // // });

    // it('generateRoomId should return a string of length 6', () => {
    //     const roomId = service['generateRoomId']();
    //     expect(roomId.length).toEqual(36);
    // });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
