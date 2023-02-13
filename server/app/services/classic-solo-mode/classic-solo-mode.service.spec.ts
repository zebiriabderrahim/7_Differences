import { GameService } from '@app/services/game/game.service';
import { Coordinate } from '@common/coordinate';
import { ClientSideGame, Differences, GameEvents, PlayRoom, ServerSideGame } from '@common/game-interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';
import { Server, Socket, BroadcastOperator } from 'socket.io';
import { ClassicSoloModeService } from './classic-solo-mode.service';

describe('ClassicSoloModeService', () => {
    let service: ClassicSoloModeService;
    let gameService: SinonStubbedInstance<GameService>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;

    const testGames: ServerSideGame[] = [
        {
            id: '0',
            name: 'test',
            isHard: true,
            original: 'data:image/png;base64,test',
            modified: 'data:image/png;base64,test',
            differencesCount: 1,
            differences: [[{ x: 0, y: 0 } as Coordinate]],
        },
    ];
    const clientSideGame: ClientSideGame = {
        id: '0',
        name: 'test',
        isHard: true,
        original: 'data:image/png;base64,test',
        modified: 'data:image/png;base64,test',
        differencesCount: 1,
        player: 'testPlayer',
        mode: 'Classic -> solo',
    };
    const diffData: Differences = {
        currentDifference: [],
        differencesFound: 0,
    };

    const fakeDiff: Differences = {
        currentDifference: [{ x: 0, y: 0 } as Coordinate],
        differencesFound: 1,
    };
    const fakeRoom: PlayRoom = {
        roomId: 'fakeRoomId',
        serverGame: testGames[0],
        clientGame: clientSideGame,
        timer: 0,
        endMessage: '',
        differencesData: diffData,
    };

    beforeEach(async () => {
        gameService = createStubInstance(GameService);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClassicSoloModeService,
                {
                    provide: GameService,
                    useValue: gameService,
                },
            ],
        }).compile();

        service = module.get<ClassicSoloModeService>(ClassicSoloModeService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('createSoloRoom() should create a new game', () => {
        gameService.getGameById.returns(testGames[0]);
        const buildClientGameVersionSpy = jest.spyOn(service, 'buildClientGameVersion');
        stub(socket, 'rooms').value(new Set([fakeRoom.roomId]));
        const joinSpy = jest.spyOn(socket, 'join');
        fakeRoom.roomId = socket.id;
        service.createSoloRoom(socket, 'testPlayer', testGames[0].id);
        expect(joinSpy).toBeCalled();
        expect(buildClientGameVersionSpy).toBeCalled();
        expect(service['rooms'].get(socket.id)).toEqual(fakeRoom);
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

    it('verifyCoords should emit the removeDiff event with coord if the coordinates are correct', () => {
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        server.to.returns({
            emit: (event: string, message: Differences) => {
                expect(event).toEqual(GameEvents.RemoveDiff);
                expect(message).toEqual(fakeDiff);
            },
        } as BroadcastOperator<unknown, unknown>);
        const toSpy = jest.spyOn(server, 'to');
        service.verifyCoords(fakeRoom.roomId, { x: 0, y: 0 }, server);
        expect(toSpy).toBeCalledWith(fakeRoom.roomId);
    });

    it('verifyCoords should emit the removeDiff event with empty currentDifference if the coordinates are not correct', () => {
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        server.to.returns({
            emit: (event: string, message: Differences) => {
                expect(event).toEqual(GameEvents.RemoveDiff);
                expect(message.currentDifference).toEqual([]);
            },
        } as BroadcastOperator<unknown, unknown>);
        const toSpy = jest.spyOn(server, 'to');
        service.verifyCoords(fakeRoom.roomId, { x: 1, y: 0 }, server);
        expect(toSpy).toBeCalledWith(fakeRoom.roomId);
    });

    it('buildClientGameVersion() should return a ClientSideGame', () => {
        const result = service.buildClientGameVersion('testPlayer', testGames[0]);
        expect(result).toEqual(clientSideGame);
    });

    it('endGame() should emit the end game event', () => {
        service['rooms'].set(fakeRoom.roomId, fakeRoom);
        server.to.returns({
            emit: (event: string, message: string) => {
                expect(event).toEqual(GameEvents.EndGame);
                expect(message).toEqual(fakeRoom.endMessage);
            },
        } as BroadcastOperator<unknown, unknown>);
        expect(service['rooms'].size).toEqual(1);
        service.endGame(fakeRoom.roomId, server);
        expect(server.to.calledWith(fakeRoom.roomId)).toBeTruthy();
        expect(service['rooms'].size).toEqual(0);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
