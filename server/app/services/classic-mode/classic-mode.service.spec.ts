/* eslint-disable no-underscore-dangle */
import { Game } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';
import { Coordinate } from '@common/coordinate';
import { ClassicPlayRoom, ClientSideGame, Differences, GameEvents, GameModes, MessageEvents } from '@common/game-interfaces';
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

    // const fakeDiff: Differences = {
    //     currentDifference: [{ x: 0, y: 0 } as Coordinate],
    //     differencesFound: 1,
    // };
    const fakeRoom: ClassicPlayRoom = {
        roomId: 'fakeRoomId',
        originalDifferences: [[{ x: 0, y: 0 } as Coordinate]],
        clientGame: clientSideGame,
        timer: 0,
        endMessage: '',
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
        const generateRoomIdSpy = jest.spyOn(service, 'generateRoomId').mockImplementation(() => 'fakeRoomId');
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

    it('endGame() should emit the end game event', () => {
        fakeRoom.clientGame.mode = GameModes.ClassicOneVsOne;
        const getRoomIdFromSocketSpy = jest.spyOn(service, 'getRoomIdFromSocket').mockReturnValue(fakeRoom.roomId);
        const getRoomByRoomIdSpy = jest.spyOn(service, 'getRoomByRoomId').mockReturnValue(fakeRoom);
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

    afterEach(() => {
        jest.clearAllMocks();
    });
});
