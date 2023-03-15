/* eslint-disable no-underscore-dangle */
// import { Game } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';
import { Coordinate } from '@common/coordinate';
import { ClassicPlayRoom, ClientSideGame, GameEvents } from '@common/game-interfaces';
import { Test, TestingModule } from '@nestjs/testing';
// import * as fs from 'fs';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { BroadcastOperator, Server } from 'socket.io';
import { ClassicModeService } from './classic-mode.service';

describe('ClassicModeService', () => {
    let service: ClassicModeService;
    let gameService: SinonStubbedInstance<GameService>;
    // let socket: SinonStubbedInstance<Socket>;
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
    // const diffData: Differences = {
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
        // socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClassicModeService,
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

    // it('createSoloRoom() should create a new game', async () => {
    //     const readFileSyncSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue('test');
    //     const parseSpy = jest.spyOn(JSON, 'parse').mockReturnValue([[{ x: 0, y: 0 } as Coordinate]]);
    //     const joinSpy = jest.spyOn(socket, 'join');
    //     gameService.getGameById.resolves(testGames[0]);
    //     const buildClientGameVersionSpy = jest.spyOn(service, 'buildClientGameVersion');
    //     stub(socket, 'rooms').value(new Set([fakeRoom.roomId]));
    //     fakeRoom.roomId = socket.id;
    //     await service.createRoom(socket, 'testPlayer', testGames[0]._id);
    //     expect(joinSpy).toBeCalled();
    //     expect(readFileSyncSpy).toBeCalled();
    //     expect(parseSpy).toBeCalled();
    //     expect(buildClientGameVersionSpy).toBeCalled();
    //     expect(service['rooms'].get(socket.id)).toEqual(fakeRoom);
    // });

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

    // it('verifyCoords should emit the removeDiff event with coord if the coordinates are correct', () => {
    //     service['rooms'].set(fakeRoom.roomId, fakeRoom);
    //     server.to.returns({
    //         emit: (event: string, message: Differences) => {
    //             expect(event).toEqual(GameEvents.RemoveDiff);
    //             expect(message).toEqual(fakeDiff);
    //         },
    //     } as BroadcastOperator<unknown, unknown>);
    //     const toSpy = jest.spyOn(server, 'to');

    //     service.verifyCoords(socket, { x: 0, y: 0 }, server);
    //     expect(toSpy).toBeCalledWith(fakeRoom.roomId);
    // });

    // it('verifyCoords should emit the removeDiff event with empty currentDifference if the coordinates are not correct', () => {
    //     service['rooms'].set(fakeRoom.roomId, fakeRoom);
    //     server.to.returns({
    //         emit: (event: string, message: Differences) => {
    //             expect(event).toEqual(GameEvents.RemoveDiff);
    //             expect(message.currentDifference).toEqual([]);
    //         },
    //     } as BroadcastOperator<unknown, unknown>);
    //     const toSpy = jest.spyOn(server, 'to');
    //     service.verifyCoords(socket, { x: 1, y: 0 }, server);
    //     expect(toSpy).toBeCalledWith(fakeRoom.roomId);
    // });

    // it('buildClientGameVersion() should return a ClientSideGame', () => {
    //     jest.spyOn(fs, 'readFileSync').mockReturnValue('test');
    //     const result = service.buildClientGameVersion('testPlayer', testGames[0]);
    //     expect(result).toEqual(clientSideGame);
    // });

    // it('endGame() should emit the end game event', () => {
    //     service['rooms'].set(fakeRoom.roomId, fakeRoom);
    //     server.to.returns({
    //         emit: (event: string, message: string) => {
    //             expect(event).toEqual(GameEvents.EndGame);
    //             expect(message).toEqual(fakeRoom.endMessage);
    //         },
    //     } as BroadcastOperator<unknown, unknown>);
    //     expect(service['rooms'].size).toEqual(1);
    //     service.endGame(fakeRoom.roomId, server);
    //     expect(server.to.calledWith(fakeRoom.roomId)).toBeTruthy();
    //     expect(service['rooms'].size).toEqual(0);
    // });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
