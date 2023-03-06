import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { Coordinate } from '@common/coordinate';
import { ClassicPlayRoom, ClientSideGame, Differences, GameEvents } from '@common/game-interfaces';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { GameGateway } from './game.gateway';
import { DELAY_BEFORE_EMITTING_TIME } from './game.gateway.constants';

describe('GameGateway', () => {
    let gateway: GameGateway;
    let classicService: SinonStubbedInstance<ClassicModeService>;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;

    const fakeRoom: ClassicPlayRoom = {
        roomId: 'fakeRoomId',
        originalDifferences: {} as Coordinate[][],
        clientGame: {} as ClientSideGame,
        timer: 0,
        endMessage: '',
        differencesData: {} as Differences,
    };

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        classicService = createStubInstance(ClassicModeService);
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
            ],
        }).compile();

        gateway = module.get<GameGateway>(GameGateway);
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('createSoloGame() should create a new game', async () => {
        classicService.createRoom.resolves(fakeRoom);
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(GameEvents.CreateSoloGame);
            },
        } as BroadcastOperator<unknown, unknown>);
        await gateway.createSoloGame(socket, 'X', '0');
        expect(classicService.createRoom.called).toBeTruthy();
    });

    // it('validateCoords() should call verifyCoords', () => {
    //     gateway.validateCoords(socket, { x: 0, y: 0 } as Coordinate);
    //     expect(classicService.verifyCoords.calledOnce).toBeTruthy();
    // });

    // it('checkStatus() should call endGame', () => {
    //     gateway.checkStatus(socket, 'fakeRoomId');
    //     expect(classicService.endGame.calledOnce).toBeTruthy();
    // });

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
        classicService['rooms'] = [fakeRoom] as unknown as Map<string, ClassicPlayRoom>;
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
