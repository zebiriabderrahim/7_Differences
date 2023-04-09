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

    // it('verifyCoords should emit the removeDiff event with coord if the coordinates are correct', () => {
    //     service['rooms'].set(fakeRoom.roomId, fakeRoom);
    //     const getRoomIdFromSocketSpy = jest.spyOn(service, 'getRoomIdFromSocket').mockReturnValue(fakeRoom.roomId);
    //     let localMessageEmitted = false;
    //     let removeDiffEmitted = false;

    //     server.to.returns({
    //         emit: (event: string) => {
    //             if (event === MessageEvents.LocalMessage && !localMessageEmitted) {
    //                 expect(event).toEqual(MessageEvents.LocalMessage);
    //                 localMessageEmitted = true;
    //             } else if (event === GameEvents.RemoveDiff && !removeDiffEmitted) {
    //                 expect(event).toEqual(GameEvents.RemoveDiff);
    //                 removeDiffEmitted = true;
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
    //         diffData,
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
    //             } else if (event === GameEvents.RemoveDiff && !removeDiffEmitted) {
    //                 expect(event).toEqual(GameEvents.RemoveDiff);
    //                 removeDiffEmitted = true;
    //             }
    //         },
    //     } as BroadcastOperator<unknown, unknown>);
    //     const toSpy = jest.spyOn(server, 'to');
    //     service.verifyCoords(socket, { x: 1, y: 0 }, server);
    //     expect(toSpy).toBeCalledWith(fakeRoom.roomId);
    //     expect(getRoomIdFromSocketSpy).toBeCalled();
    // });

    // it('getRoomIdFromSocket() should call from and values', () => {
    //     stub(socket, 'rooms').value(new Set(['fakeRoomId']));
    //     const valuesSpy = jest.spyOn(socket.rooms, 'values');
    //     const fromSpy = jest.spyOn(Array, 'from');
    //     service.getRoomIdFromSocket(socket);
    //     expect(fromSpy).toBeCalled();
    //     expect(valuesSpy).toBeCalled();
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
});
