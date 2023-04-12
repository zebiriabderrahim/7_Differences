import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { PlayersListManagerService } from '@app/services/players-list-manager/players-list-manager.service';
import { RoomsManagerService } from '@app/services/rooms-manager/rooms-manager.service';
// import { Coordinate } from '@common/coordinate';
// import { ClassicPlayRoom, ClientSideGame, Differences, GameEvents, GameModes, MessageEvents, MessageTag, Player } from '@common/game-interfaces';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Server } from 'socket.io';
import { GameGateway } from './game.gateway';
import { LimitedModeService } from '@app/services//limited-mode/limited-mode.service';

// import { DELAY_BEFORE_EMITTING_TIME } from './game.gateway.constants';

describe('GameGateway', () => {
    let gateway: GameGateway;
    let classicService: SinonStubbedInstance<ClassicModeService>;
    let playersListManagerService: SinonStubbedInstance<PlayersListManagerService>;
    let logger: SinonStubbedInstance<Logger>;
    // let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let roomsManagerService: SinonStubbedInstance<RoomsManagerService>;
    let limitedModeService: SinonStubbedInstance<LimitedModeService>;

    // const fakeRoom: ClassicPlayRoom = {
    //     roomId: 'fakeRoomId',
    //     originalDifferences: [{}] as Coordinate[][],
    //     clientGame: {
    //         id: 'fakeGameId',
    //         name: 'fakeGameName',
    //         mode: GameModes.ClassicSolo,
    //     } as ClientSideGame,
    //     timer: 0,
    //     endMessage: '',
    //     player1: {
    //         playerId: 'fakePlayerId1',
    //         name: 'fakePlayerName',
    //         differenceData: {} as Differences,
    //     },
    //     player2: {
    //         playerId: 'fakePlayerId2',
    //         name: 'fakePlayerName',
    //         differenceData: {} as Differences,
    //     },
    // };

    // const fakeData = { gameId: 'fakeRoomId', playerName: 'fakePlayerName' };

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        // socket = createStubInstance<Socket>(Socket);
        playersListManagerService = createStubInstance(PlayersListManagerService);
        server = createStubInstance<Server>(Server);
        classicService = createStubInstance(ClassicModeService);
        roomsManagerService = createStubInstance(RoomsManagerService);
        limitedModeService = createStubInstance(LimitedModeService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameGateway,
                {
                    provide: Logger,
                    useValue: logger,
                },
                {
                    provide: ClassicModeService,
                    useValue: classicService,
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
                    provide: LimitedModeService,
                    useValue: limitedModeService,
                },
            ],
        }).compile();

        gateway = module.get<GameGateway>(GameGateway);
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    // it('createSoloGame() should create new Solo room ', async () => {
    //     fakeRoom.player2.playerId = '0';
    //     classicService.createRoom.resolves(fakeRoom);
    //     server.to.returns({
    //         emit: (event: string) => {
    //             expect(event).toEqual(GameEvents.RoomSoloCreated);
    //         },
    //     } as BroadcastOperator<unknown, unknown>);
    //     await gateway.createSoloRoom(socket, 'X', '0');
    //     expect(classicService.createRoom.called).toBeTruthy();
    //     expect(server.to.called).toBeTruthy();
    //     expect(classicService.saveRoom).toBeTruthy();
    // });

    // it('createOneVsOneRoom() should create new OneVsOne room ', async () => {
    //     classicService.createOneVsOneRoom.resolves(fakeRoom);
    //     server.to.returns({
    //         emit: (event: string) => {
    //             expect(event).toEqual(GameEvents.RoomOneVsOneCreated);
    //         },
    //     } as BroadcastOperator<unknown, unknown>);
    //     await gateway.createOneVsOneRoom(socket, '0');
    //     expect(classicService.createOneVsOneRoom.called).toBeTruthy();
    //     expect(classicService.saveRoom).toBeTruthy();
    // });

    // it('startGame() should call startGame and start Classic solo', () => {
    //     fakeRoom.player2 = undefined;
    //     fakeRoom.player1.name = 'fakePlayerName';
    //     const flatSpy = jest.spyOn(Array.prototype, 'flat').mockImplementation(() => {
    //         return [];
    //     });
    //     const joinSpy = jest.spyOn(socket, 'join');
    //     classicService.getRoomById.returns(fakeRoom);
    //     server.to.returns({
    //         emit: (event: string) => {
    //             expect(event).toEqual(GameEvents.GameStarted);
    //             expect(flatSpy).toHaveBeenCalled();
    //         },
    //     } as BroadcastOperator<unknown, unknown>);
    //     gateway.startGame(socket, 'fakeRoomId', 'fakePlayerName');
    //     expect(classicService.getRoomById.calledOnce).toBeTruthy();
    //     expect(classicService.saveRoom).toBeTruthy();
    //     expect(joinSpy).toHaveBeenCalled();
    // });

    // it('startGame() should attribute socket id to player1 id', () => {
    //     fakeRoom.clientGame.mode = GameModes.ClassicOneVsOne;
    //     fakeRoom.player2 = undefined;
    //     const flatSpy = jest.spyOn(Array.prototype, 'flat').mockImplementation(() => {
    //         return [];
    //     });
    //     const joinSpy = jest.spyOn(socket, 'join');
    //     classicService.getRoomById.returns(fakeRoom);
    //     server.to.returns({
    //         emit: (event: string) => {
    //             expect(event).toEqual(GameEvents.GameStarted);
    //             expect(flatSpy).toHaveBeenCalled();
    //         },
    //     } as BroadcastOperator<unknown, unknown>);
    //     fakeRoom.player2 = {} as Player;
    //     gateway.startGame(socket, 'fakeRoomId', 'fakePlayerId2');
    //     expect(classicService.getRoomById.calledOnce).toBeTruthy();
    //     expect(classicService.saveRoom).toBeTruthy();
    //     expect(joinSpy).toHaveBeenCalled();
    // });

    // it('startGame() should not call startGame in cas of invalid roomId', () => {
    //     jest.spyOn(classicService, 'getRoomByRoomId').mockImplementation(() => {
    //         return undefined;
    //     });
    //     server.to.returns({
    //         emit: (event: string) => {
    //             expect(event).toEqual(GameEvents.GameStarted);
    //         },
    //     } as BroadcastOperator<unknown, unknown>);
    //     gateway.startGame(socket, 'fakeRoomId', 'fakePlayerId2');
    //     expect(classicService.getRoomById.calledOnce).toBeFalsy();
    // });

    // it('validateCoords() should call verifyCoords', () => {
    //     gateway.validateCoords(socket, { x: 0, y: 0 } as Coordinate);
    //     expect(classicService.verifyCoords.calledOnce).toBeTruthy();
    // });

    // it('checkStatus() should call endGame', () => {
    //     gateway.checkStatus(socket);
    //     expect(classicService.endGame.calledOnce).toBeTruthy();
    // });

    // it('updateRoomOneVsOneAvailability should call updateRoomOneVsOneAvailability', () => {
    //     gateway.updateRoomOneVsOneAvailability('fakeRoomId');
    //     expect(classicService.updateRoomOneVsOneAvailability.calledOnce).toBeTruthy();
    // });

    // it('checkRoomOneVsOneAvailability should call deleteOneVsOneRoomAvailability', () => {
    //     gateway.checkRoomOneVsOneAvailability('fakeRoomId');
    //     expect(classicService.checkRoomOneVsOneAvailability.calledOnce).toBeTruthy();
    // });

    // it('deleteCreatedOneVsOneRoom should call deleteOneVsOneRoomAvailability', () => {
    //     server.to.returns({
    //         emit: (event: string) => {
    //             expect(event).toEqual(GameEvents.UndoCreation);
    //         },
    //     } as BroadcastOperator<unknown, unknown>);
    //     gateway.deleteCreatedOneVsOneRoom('fakeRoomId');
    //     expect(classicService.deleteOneVsOneRoomAvailability.calledOnce).toBeTruthy();
    //     expect(classicService.cancelAllJoining.calledOnce).toBeTruthy();
    // });

    // it('updateWaitingPlayerNameList should call updateWaitingPlayerNameList', () => {
    //     server.to.returns({
    //         emit: (event: string) => {
    //             expect(event).toEqual(GameEvents.UpdateWaitingPlayerNameList);
    //         },
    //     } as BroadcastOperator<unknown, unknown>);
    //     gateway.updateWaitingPlayerNameList(socket, fakeData);
    //     expect(classicService.updateWaitingPlayerNameList.calledOnce).toBeTruthy();
    //     expect(classicService.getWaitingPlayerNameList.calledOnce).toBeTruthy();
    // });

    // it('refusePlayer should call refusePlayer', () => {
    //     server.to.returns({
    //         emit: (event: string) => {
    //             expect(event).toEqual(GameEvents.RefusePlayer);
    //         },
    //     } as BroadcastOperator<unknown, unknown>);
    //     gateway.refusePlayer(fakeData);
    //     expect(classicService.refusePlayer.calledOnce).toBeTruthy();
    // });

    // it('acceptPlayer should call acceptPlayer', () => {
    //     const fakeAcceptedData = { gameId: 'fakeGameId', roomId: 'fakeRoomId', playerNameCreator: 'fakePlayer' };
    //     server.to.returns({
    //         emit: (event: string) => {
    //             expect(event).toEqual(GameEvents.AcceptPlayer);
    //         },
    //     } as BroadcastOperator<unknown, unknown>);
    //     gateway.acceptPlayer(fakeAcceptedData);
    //     expect(classicService.acceptPlayer.calledOnce).toBeTruthy();
    //     expect(classicService.updateRoomOneVsOneAvailability.calledOnce).toBeTruthy();
    // });

    // it('checkIfPlayerNameIsAvailable should call checkIfPlayerNameIsAvailable', () => {
    //     gateway.checkIfPlayerNameIsAvailable(fakeData);
    //     expect(classicService.checkIfPlayerNameIsAvailable.calledOnce).toBeTruthy();
    // });

    // it('cancelJoining should call cancelJoining', () => {
    //     const fakeCancelJoiningData = { roomId: 'fakeRoomId', playerName: 'fakePlayer' };
    //     gateway.cancelJoining(fakeCancelJoiningData);
    //     expect(classicService.cancelJoining.calledOnce).toBeTruthy();
    // });

    // it('abandonGame should call abandonGame', () => {
    //     gateway.abandonGame(socket);
    //     expect(classicService.abandonGame.calledOnce).toBeTruthy();
    // });

    // it('sendMessage should call getRoomIdFromSocket', () => {
    //     const fakeMessage = { tag: {} as MessageTag, message: 'fakeMessage' };
    //     const roomId = 'testRoomId';
    //     const mockBroadcast = {
    //         to: jest.fn().mockReturnThis(),
    //         emit: jest.fn(),
    //     };
    //     const mockSocket = { broadcast: mockBroadcast } as unknown as Socket;
    //     jest.spyOn(classicService, 'getRoomIdFromSocket').mockReturnValueOnce(roomId);
    //     gateway.sendMessage(mockSocket, fakeMessage);
    //     expect(classicService.getRoomIdFromSocket).toHaveBeenCalledWith(mockSocket);
    //     expect(mockBroadcast.to).toHaveBeenCalledWith(roomId);
    //     expect(mockBroadcast.emit).toHaveBeenCalledWith(MessageEvents.LocalMessage, fakeMessage);
    // });

    // it('gameCardDeleted should emit GameCardDeleted on event', () => {
    //     server.to.returns({
    //         emit: (event: string) => {
    //             expect(event).toEqual(GameEvents.AcceptPlayer);
    //         },
    //     } as BroadcastOperator<unknown, unknown>);
    //     gateway.gameCardDeleted('fakeRoomId');
    // });

    // it('afterInit() should emit time after 1s', () => {
    //     classicService['rooms'] = [fakeRoom] as unknown as Map<string, ClassicPlayRoom>;
    //     const updateTimersSpy = jest.spyOn(gateway, 'updateTimers').mockImplementation(() => {
    //         return;
    //     });
    //     jest.useFakeTimers();
    //     gateway.afterInit();
    //     jest.advanceTimersByTime(DELAY_BEFORE_EMITTING_TIME);
    //     expect(updateTimersSpy).toBeCalled();
    //     expect(classicService.updateTimer).toBeTruthy();
    // });

    // it('handleDisconnect() should call endGame', () => {
    //     gateway.handleDisconnect(socket);
    //     expect(classicService.handleSocketDisconnect).toBeTruthy();
    // });

    // it('id of connected socket should be logged on connection', () => {
    //     gateway.handleConnection(socket);
    //     expect(logger.log.called).toBeTruthy();
    // });

    // it('updateTimers should call getRoomByRoomId an updateTimer', () => {
    //     fakeRoom.clientGame.mode = GameModes.ClassicSolo;
    //     classicService.getRoomById.returns(fakeRoom);
    //     classicService['rooms'] = [fakeRoom] as unknown as Map<string, ClassicPlayRoom>;
    //     gateway.updateTimers();
    //     expect(classicService.getRoomById).toBeTruthy();
    //     expect(classicService.updateTimer).toBeTruthy();
    // });
});
