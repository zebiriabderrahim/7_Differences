import { ClassicSoloModeService } from '@app/services/classic-solo-mode/classic-solo-mode.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket, BroadcastOperator } from 'socket.io';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';
import { GameGateway } from './game.gateway';
import { ClientSideGame, Differences, GameEvents, PlayRoom, ServerSideGame } from '@common/game-interfaces';
import { Coordinate } from '@common/coordinate';
import { DELAY_BEFORE_EMITTING_TIME } from './game.gateway.constants';

describe('GameGateway', () => {
    let gateway: GameGateway;
    let classicService: SinonStubbedInstance<ClassicSoloModeService>;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;

    const fakeRoom: PlayRoom = {
        roomId: 'fakeRoomId',
        serverGame: {} as ServerSideGame,
        clientGame: {} as ClientSideGame,
        timer: 0,
        endMessage: '',
        differencesData: {} as Differences,
    };

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        classicService = createStubInstance(ClassicSoloModeService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameGateway,
                {
                    provide: Logger,
                    useValue: logger,
                },
                {
                    provide: ClassicSoloModeService,
                    useValue: classicService,
                },
            ],
        }).compile();

        gateway = module.get<GameGateway>(GameGateway);
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('createSoloGame() should create a new game', () => {
        const createSoloGameSpy = jest.spyOn(classicService, 'createSoloRoom').mockImplementation(() => {
            return fakeRoom;
        });
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameEvents.CreateSoloGame);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.createSoloGame(socket, 'X', '0');
        expect(createSoloGameSpy).toBeCalled();
    });

    it('createSoloGame() should not create a new game in cas of thrown error', () => {
        jest.spyOn(classicService, 'createSoloRoom').mockImplementation(() => {
            throw new Error();
        });
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameEvents.CreateSoloGame);
            },
        } as BroadcastOperator<unknown, unknown>);
    });

    it('validateCoords() should call verifyCoords', () => {
        gateway.validateCoords(socket, { x: 0, y: 0 } as Coordinate);
        expect(classicService.verifyCoords.calledOnce).toBeTruthy();
    });

    it('validateCoords() should not call verifyCoords in cas of thrown error', () => {
        jest.spyOn(classicService, 'verifyCoords').mockImplementation(() => {
            throw new Error();
        });
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameEvents.RemoveDiff);
            },
        } as BroadcastOperator<unknown, unknown>);
        expect(classicService.verifyCoords.calledOnce).toBeFalsy();
    });

    it('checkStatus() should call endGame', () => {
        gateway.checkStatus(socket.id);
        expect(classicService.endGame.calledOnce).toBeTruthy();
    });

    it('checkStatus() should not call endGame in cas of thrown error', () => {
        jest.spyOn(classicService, 'endGame').mockImplementation(() => {
            throw new Error();
        });
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameEvents.EndGame);
            },
        } as BroadcastOperator<unknown, unknown>);
        expect(classicService.endGame.calledOnce).toBeFalsy();
    });

    it('afterInit() should emit time after 1s', () => {
        classicService['rooms'] = [fakeRoom] as unknown as Map<string, PlayRoom>;
        const updateTimersSpy = jest.spyOn(gateway, 'updateTimers');
        jest.useFakeTimers();
        gateway.afterInit();
        jest.advanceTimersByTime(DELAY_BEFORE_EMITTING_TIME);
        expect(updateTimersSpy).toBeCalled();
        expect(classicService.updateTimer.calledOnce).toBeTruthy();
    });

    it('handleDisconnect() should call endGame', () => {
        gateway.handleDisconnect(socket);
        expect(classicService.endGame.calledOnce).toBeTruthy();
    });

    it('id of connected socket should be logged on connection', () => {
        gateway.handleConnection(socket);
        expect(logger.log.called).toBeTruthy();
    });
});
