import { LimitedModeService } from '@app/services//limited-mode/limited-mode.service';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { PlayersListManagerService } from '@app/services/players-list-manager/players-list-manager.service';
import { RoomsManagerService } from '@app/services/rooms-manager/rooms-manager.service';
import { Coordinate } from '@common/coordinate';
import { GameCardEvents, GameModes } from '@common/enums';
import { ClientSideGame, Differences, GameConfigConst, GameRoom, PlayerData } from '@common/game-interfaces';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, assert, createStubInstance } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { GameGateway } from './game.gateway';

import { DELAY_BEFORE_EMITTING_TIME } from './game.gateway.constants';

describe('GameGateway', () => {
    let gateway: GameGateway;
    let classicService: SinonStubbedInstance<ClassicModeService>;
    let playersListManagerService: SinonStubbedInstance<PlayersListManagerService>;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let roomsManagerService: SinonStubbedInstance<RoomsManagerService>;
    let limitedModeService: SinonStubbedInstance<LimitedModeService>;

    const fakeRoom: GameRoom = {
        roomId: 'fakeRoomId',
        originalDifferences: [{}] as Coordinate[][],
        clientGame: {
            id: 'fakeGameId',
            name: 'fakeGameName',
            mode: GameModes.ClassicSolo,
        } as ClientSideGame,
        timer: 0,
        endMessage: '',
        player1: {
            playerId: 'fakePlayerId1',
            name: 'fakePlayerName',
            diffData: {} as Differences,
        },
        player2: {
            playerId: 'fakePlayerId2',
            name: 'fakePlayerName',
            diffData: {} as Differences,
        },
        gameConstants: {} as GameConfigConst,
    };

    const fakeData = { gameId: 'fakeRoomId', playerName: 'fakePlayerName', gameMode: GameModes.ClassicSolo } as PlayerData;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
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

    it('startGame() should call startGame in roomsManagerService', () => {
        const startGameSpy = jest.spyOn(roomsManagerService, 'startGame');
        gateway.startGame(socket);
        expect(startGameSpy).toHaveBeenCalled();
    });

    it('createSoloRoom() should call createSoloRoom in classicModeService', async () => {
        const classicModeServiceSpy = jest.spyOn(classicService, 'createSoloRoom');
        await gateway.createSoloRoom(socket, fakeData);
        expect(classicModeServiceSpy).toHaveBeenCalled();
    });

    it('createOneVsOneRoom() should call createOneVsOneRoom in classicModeService', async () => {
        const classicModeServiceSpy = jest.spyOn(classicService, 'createOneVsOneRoom');
        await gateway.createOneVsOneRoom(socket, fakeData);
        expect(classicModeServiceSpy).toHaveBeenCalled();
    });

    it('createLimitedRoom() should call createLimitedRoom in limitedModeService', async () => {
        const limitedModeServiceSpy = jest.spyOn(limitedModeService, 'createLimitedRoom');
        await gateway.createLimitedRoom(socket, fakeData);
        expect(limitedModeServiceSpy).toHaveBeenCalled();
    });

    it('startNextGame() should call startNextGame in limitedModeService', async () => {
        const startNextGameSpy = jest.spyOn(limitedModeService, 'startNextGame');
        await gateway.startNextGame(socket);
        expect(startNextGameSpy).toHaveBeenCalled();
    });

    it('validateCoords() should call verifyCoords in roomsManagerService', () => {
        const verifyCoordsSpy = jest.spyOn(roomsManagerService, 'validateCoords');
        gateway.validateCoords(socket, { x: 0, y: 0 } as Coordinate);
        expect(verifyCoordsSpy).toHaveBeenCalled();
    });

    it('checkStatus() should call checkStatus in classicModeService', () => {
        const checkStatusSpy = jest.spyOn(classicService, 'checkStatus');
        gateway.checkStatus(socket);
        expect(checkStatusSpy).toHaveBeenCalled();
    });

    it('updateRoomOneVsOneAvailability() should call updateRoomOneVsOneAvailability in classicModeService', () => {
        const updateRoomOneVsOneAvailabilitySpy = jest.spyOn(classicService, 'updateRoomOneVsOneAvailability');
        gateway.updateRoomOneVsOneAvailability(socket, 'fakeRoomId');
        expect(updateRoomOneVsOneAvailabilitySpy).toHaveBeenCalled();
    });

    it('checkRoomOneVsOneAvailability() should call checkRoomOneVsOneAvailability in classicModeService', () => {
        const checkRoomOneVsOneAvailabilitySpy = jest.spyOn(classicService, 'checkRoomOneVsOneAvailability');
        gateway.checkRoomOneVsOneAvailability(socket, 'fakeRoomId');
        expect(checkRoomOneVsOneAvailabilitySpy).toHaveBeenCalled();
    });

    it('deleteCreatedOneVsOneRoom() should call deleteCreatedRoom in classicModeService', () => {
        const getRoomByIdSpy = jest.spyOn(roomsManagerService, 'getRoomById').mockReturnValueOnce(fakeRoom);
        const cancelAllJoiningSpy = jest.spyOn(playersListManagerService, 'cancelAllJoining');
        const deleteCreatedRoomSpy = jest.spyOn(classicService, 'deleteCreatedRoom');
        gateway.deleteCreatedOneVsOneRoom(socket, 'fakeRoomId');
        expect(deleteCreatedRoomSpy).toHaveBeenCalled();
        expect(getRoomByIdSpy).toHaveBeenCalled();
        expect(cancelAllJoiningSpy).toHaveBeenCalled();
    });

    it('deleteCreatedOneVsOneRoom() should call deleteCreatedOneVsOneRoom in classicModeService (room undefine )', () => {
        const getRoomByIdSpy = jest.spyOn(roomsManagerService, 'getRoomById').mockReturnValueOnce(undefined);
        const cancelAllJoiningSpy = jest.spyOn(playersListManagerService, 'cancelAllJoining');
        const deleteCreatedRoomSpy = jest.spyOn(classicService, 'deleteCreatedRoom');
        gateway.deleteCreatedOneVsOneRoom(socket, 'fakeRoomId');
        expect(deleteCreatedRoomSpy).toHaveBeenCalledTimes(0);
        expect(getRoomByIdSpy).toHaveBeenCalled();
        expect(cancelAllJoiningSpy).toHaveBeenCalledTimes(0);
    });

    it('deleteCreatedCoopRoom() should call deleteAvailableGame in limitedModeService and leave room', () => {
        const roomsManagerServiceSpy = jest.spyOn(roomsManagerService, 'deleteRoom');
        const deleteAvailableGameSpy = jest.spyOn(limitedModeService, 'deleteAvailableGame');
        const leaveSpy = jest.spyOn(socket, 'leave');
        gateway.deleteCreatedCoopRoom(socket, 'fakeRoomId');
        expect(roomsManagerServiceSpy).toHaveBeenCalled();
        expect(deleteAvailableGameSpy).toHaveBeenCalled();
        expect(leaveSpy).toHaveBeenCalled();
    });

    it('getJoinedPlayerNames() should call getJoinedPlayerNames in roomsManagerService', () => {
        const getJoinedPlayerNamesSpy = jest.spyOn(playersListManagerService, 'getWaitingPlayerNameList');
        gateway.getJoinedPlayerNames(socket, 'fakeRoomId');
        expect(getJoinedPlayerNamesSpy).toHaveBeenCalled();
    });

    it('updateWaitingPlayerNameList() should call updateWaitingPlayerNameList in playersListManagerService', () => {
        const getWaitingPlayerNameListSpy = jest.spyOn(playersListManagerService, 'getWaitingPlayerNameList');
        const getHostIdByGameIdSpy = jest.spyOn(roomsManagerService, 'getHostIdByGameId');
        const updateWaitingPlayerNameListSpy = jest.spyOn(playersListManagerService, 'updateWaitingPlayerNameList');
        gateway.updateWaitingPlayerNameList(socket, fakeData);
        expect(updateWaitingPlayerNameListSpy).toHaveBeenCalled();
        expect(getWaitingPlayerNameListSpy).toHaveBeenCalled();
        expect(getHostIdByGameIdSpy).toHaveBeenCalled();
    });

    it('refusePlayer() should call refusePlayer in playersListManagerService', () => {
        const getWaitingPlayerNameListSpy = jest.spyOn(playersListManagerService, 'getWaitingPlayerNameList');
        const refusePlayerSpy = jest.spyOn(playersListManagerService, 'refusePlayer');
        gateway.refusePlayer(socket, fakeData);
        expect(refusePlayerSpy).toHaveBeenCalled();
        expect(getWaitingPlayerNameListSpy).toHaveBeenCalled();
    });

    it('acceptPlayer() should call acceptPlayer in playersListManagerService', () => {
        const getAcceptPlayerSpy = jest.spyOn(playersListManagerService, 'getAcceptPlayer');
        const acceptPlayerSpy = jest.spyOn(classicService, 'acceptPlayer');
        const deleteJoinedPlayersByGameIdSpy = jest.spyOn(playersListManagerService, 'deleteJoinedPlayersByGameId');
        gateway.acceptPlayer(socket, { gameId: 'fakeGameId', roomId: 'fakeRoomId', playerName: 'fakePlayer' });
        expect(acceptPlayerSpy).toHaveBeenCalled();
        expect(getAcceptPlayerSpy).toHaveBeenCalled();
        expect(deleteJoinedPlayersByGameIdSpy).toHaveBeenCalled();
    });

    it('checkIfPlayerNameIsAvailable() should call checkIfPlayerNameIsAvailable in classicModeService', () => {
        const checkIfPlayerNameIsAvailableSpy = jest.spyOn(playersListManagerService, 'checkIfPlayerNameIsAvailable');
        gateway.checkIfPlayerNameIsAvailable(fakeData);
        expect(checkIfPlayerNameIsAvailableSpy).toHaveBeenCalled();
    });

    it('cancelJoining() should call cancelJoining in playersListManagerService', () => {
        const cancelJoiningSpy = jest.spyOn(playersListManagerService, 'cancelJoiningByPlayerId');
        gateway.cancelJoining(socket, 'fakeRoomId');
        expect(cancelJoiningSpy).toHaveBeenCalled();
    });

    it('abandonGame() should call abandonGame in roomsManagerService', () => {
        const abandonGameSpy = jest.spyOn(roomsManagerService, 'abandonGame');
        gateway.abandonGame(socket);
        expect(abandonGameSpy).toHaveBeenCalled();
    });

    it('checkIfAnyCoopRoomExists() should call checkIfAnyCoopRoomExists in limitedModeService', () => {
        const checkIfAnyCoopRoomExistsSpy = jest.spyOn(limitedModeService, 'checkIfAnyCoopRoomExists');
        gateway.checkIfAnyCoopRoomExists(socket, {} as PlayerData);
        expect(checkIfAnyCoopRoomExistsSpy).toHaveBeenCalled();
    });

    // it('sendMessage() should broadcast on MessageEvents ', () => {;
    //     stub(socket, 'broadcast').returns({
    //         emit: (events: string) => {
    //             expect(events).toBe(MessageEvents.LocalMessage);
    //         },
    //     } as BroadcastOperator<unknown, unknown>);

    //     gateway.sendMessage(socket, {} as ChatMessage);
    //     expect(socket.broadcast.emit).toHaveBeenCalled();
    // });

    it('gameCardDeleted() should call handleDeleteGame in limitedModeService and emit on GameDeleted and RequestReload events ', () => {
        const handleDeleteGameSpy = jest.spyOn(limitedModeService, 'handleDeleteGame');
        server.to.returns({
            emit: (events: string) => {
                expect(events).toBe(GameCardEvents.GameDeleted || GameCardEvents.RequestReload);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.gameCardDeleted('fakeRoomId');
        expect(handleDeleteGameSpy).toHaveBeenCalled();
    });

    it('gameCardCreated() should emit on GameCreated and RequestReload events ', () => {
        server.to.returns({
            emit: (events: string) => {
                expect(events).toBe(GameCardEvents.RequestReload);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.gameCardCreated();
    });

    it('resetTopTime() should call resetTopTime in playersListManagerService', () => {
        const resetTopTimeSpy = jest.spyOn(playersListManagerService, 'resetTopTime');
        gateway.resetTopTime('fakeRoomId');
        expect(resetTopTimeSpy).toHaveBeenCalled();
    });

    it('allGamesDeleted() should emit on RequestReload event ', () => {
        const handleDeleteAllGamesSpy = jest.spyOn(limitedModeService, 'handleDeleteAllGames');
        gateway.allGamesDeleted();
        expect(handleDeleteAllGamesSpy).toHaveBeenCalled();
        assert.calledOnce(server.emit);
        assert.calledWith(server.emit, GameCardEvents.RequestReload);
    });

    it('resetAllTopTime() should call resetAllTopTime in playersListManagerService', () => {
        const resetAllTopTimeSpy = jest.spyOn(playersListManagerService, 'resetAllTopTime');
        gateway.resetAllTopTime();
        expect(resetAllTopTimeSpy).toHaveBeenCalled();
    });

    it('gameConstantsUpdated() should emit on RequestReload event and call getGameConstants in roomsManagerService  ', async () => {
        const getGameConstantsSpy = jest.spyOn(roomsManagerService, 'getGameConstants');
        gateway.gameConstantsUpdated();
        expect(getGameConstantsSpy).toHaveBeenCalled();
        assert.calledOnce(server.emit);
        assert.calledWith(server.emit, GameCardEvents.RequestReload);
    });

    it('requestHint() should call requestHint in roomsManagerService', () => {
        const requestHintSpy = jest.spyOn(roomsManagerService, 'addHintPenalty');
        gateway.requestHint(socket);
        expect(requestHintSpy).toHaveBeenCalled();
    });

    it('afterInit() should emit time after 1s', () => {
        const updateTimersSpy = jest.spyOn(roomsManagerService, 'updateTimers').mockImplementation(() => {
            return;
        });
        jest.useFakeTimers();
        gateway.afterInit();
        jest.advanceTimersByTime(DELAY_BEFORE_EMITTING_TIME);
        expect(updateTimersSpy).toBeCalled();
    });

    it('handleDisconnect() should call endGame', () => {
        gateway.handleDisconnect(socket);
        expect(classicService.handleSocketDisconnect).toBeTruthy();
    });

    it('id of connected socket should be logged on connection', () => {
        gateway.handleConnection(socket);
        expect(logger.log.called).toBeTruthy();
    });
});
