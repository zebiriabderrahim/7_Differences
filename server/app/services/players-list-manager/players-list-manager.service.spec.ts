import { Test, TestingModule } from '@nestjs/testing';
import { assert, createStubInstance, SinonStubbedInstance } from 'sinon';
import { GameService } from '@app/services/game/game.service';
import { PlayersListManagerService } from './players-list-manager.service';
import { MessageManagerService } from '@app/services/message-manager/message-manager.service';
import { GameCardEvents, GameModes, MessageEvents, PlayerEvents, RoomEvents } from '@common/enums';
import { Coordinate } from '@common/coordinate';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { ClientSideGame, GameRoom, NewRecord, PlayerTime } from '@common/game-interfaces';
import { GameConstantsDto } from '@app/model/dto/game/game-constants.dto';

describe('PlayersListManagerService', () => {
    let service: PlayersListManagerService;
    let gameService: SinonStubbedInstance<GameService>;
    let messageManagerService: SinonStubbedInstance<MessageManagerService>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;

    const fakePlayerPayload = {
        gameId: 'testGame',
        playerName: 'testPlayer',
        gameMode: GameModes.ClassicSolo,
    };

    const fakePlayer = {
        playerId: 'testPlayer',
        name: 'testPlayer',
        differenceData: {
            currentDifference: [] as Coordinate[],
            differencesFound: 0,
        },
    };

    const gameConfigConstTest: GameConstantsDto = {
        countdownTime: 30,
        penaltyTime: 5,
        bonusTime: 5,
    };

    const fakeRoom: GameRoom = {
        roomId: 'fakeRoomId',
        originalDifferences: [[{ x: 0, y: 0 }]] as Coordinate[][],
        clientGame: {} as ClientSideGame,
        timer: 0,
        endMessage: '',
        player1: fakePlayer,
        player2: fakePlayer,
        gameConstants: gameConfigConstTest,
    };

    const defaultBestTimes: PlayerTime[] = [
        { name: 'John Doe', time: 100 },
        { name: 'Jane Doe', time: 200 },
        { name: 'the scream', time: 250 },
    ];

    beforeEach(async () => {
        gameService = createStubInstance(GameService);
        messageManagerService = createStubInstance(MessageManagerService);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlayersListManagerService,
                {
                    provide: GameService,
                    useValue: gameService,
                },
                {
                    provide: MessageManagerService,
                    useValue: messageManagerService,
                },
            ],
        }).compile();

        service = module.get<PlayersListManagerService>(PlayersListManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('updateWaitingPlayerNameList should add player to the list  (empty array cas)', () => {
        Object.defineProperty(socket, 'id', { value: fakePlayer.playerId });
        service.updateWaitingPlayerNameList(fakePlayerPayload, socket);
        expect(service['joinedPlayersByGameId'].get(fakePlayerPayload.gameId)).toEqual([fakePlayer]);
    });

    it('updateWaitingPlayerNameList should add empty array if game id does not exist', () => {
        service['joinedPlayersByGameId'].set(fakePlayerPayload.gameId, [fakePlayer]);
        Object.defineProperty(socket, 'id', { value: fakePlayer.playerId });
        service.updateWaitingPlayerNameList(fakePlayerPayload, socket);
        expect(service['joinedPlayersByGameId'].get(fakePlayerPayload.gameId)).toEqual([fakePlayer, fakePlayer]);
    });

    it('getWaitingPlayerNameList should emit WaitingPlayerNameListUpdated event', () => {
        Object.defineProperty(socket, 'id', { value: fakePlayer.playerId });
        const fromSpy = jest.spyOn(Array, 'from');
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(PlayerEvents.WaitingPlayerNameListUpdated);
            },
        } as BroadcastOperator<unknown, unknown>);

        service['joinedPlayersByGameId'].set(fakePlayerPayload.gameId, [fakePlayer]);
        service.getWaitingPlayerNameList(socket.id, fakePlayerPayload.gameId, server);
        expect(fromSpy).toHaveBeenCalled();
    });

    it('getWaitingPlayerNameList should emit WaitingPlayerNameListUpdated event (empty array cas)', () => {
        const fromSpy = jest.spyOn(Array, 'from');
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(PlayerEvents.WaitingPlayerNameListUpdated);
            },
        } as BroadcastOperator<unknown, unknown>);
        service.getWaitingPlayerNameList(socket.id, fakePlayerPayload.gameId, server);
        expect(fromSpy).toHaveBeenCalled();
    });

    it('refusePlayer should call cancelJoiningByPlayerName', () => {
        service['cancelJoiningByPlayerName'] = jest.fn().mockImplementationOnce(() => {
            return;
        });
        service.refusePlayer(fakePlayerPayload, server);
        expect(service['cancelJoiningByPlayerName']).toHaveBeenCalled();
    });

    it('getAcceptPlayer should call cancelAllJoining if acceptPlayer is defined', () => {
        service['cancelAllJoining'] = jest.fn();
        const getSpy = jest.spyOn(service['joinedPlayersByGameId'], 'get').mockImplementationOnce(() => {
            return [fakePlayer];
        });
        service.getAcceptPlayer(fakePlayerPayload.gameId, server);
        expect(service['cancelAllJoining']).toHaveBeenCalled();
        expect(getSpy).toHaveBeenCalled();
    });

    it('getAcceptPlayer should not call cancelAllJoining if acceptPlayer is undefined', () => {
        service['cancelAllJoining'] = jest.fn();
        service.getAcceptPlayer(fakePlayerPayload.gameId, server);
        expect(service['cancelAllJoining']).not.toHaveBeenCalled();
    });

    it('checkIfPlayerNameIsAvailable should emit PlayerNameTaken event if name is taken', () => {
        const getSpy = jest.spyOn(service['joinedPlayersByGameId'], 'get').mockImplementationOnce(() => {
            return [fakePlayer, fakePlayer];
        });
        const someSpy = jest.spyOn(Array.prototype, 'some');
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(PlayerEvents.PlayerNameTaken);
            },
        } as BroadcastOperator<unknown, unknown>);
        service.checkIfPlayerNameIsAvailable(fakePlayerPayload, server);
        expect(getSpy).toHaveBeenCalled();
        expect(someSpy).toHaveBeenCalled();
    });

    it('checkIfPlayerNameIsAvailable should emit PlayerNameAvailable event if name is not taken', () => {
        const getSpy = jest.spyOn(service['joinedPlayersByGameId'], 'get').mockImplementationOnce(() => {
            return undefined;
        });
        const someSpy = jest.spyOn(Array.prototype, 'some');
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(PlayerEvents.PlayerNameTaken);
            },
        } as BroadcastOperator<unknown, unknown>);
        service.checkIfPlayerNameIsAvailable(fakePlayerPayload, server);
        expect(getSpy).toHaveBeenCalled();
        expect(someSpy).toHaveBeenCalled();
    });

    it('cancelJoiningByPlayerId should delete the player from joinedPlayerNamesByGameId if it exists', () => {
        const getSpy = jest.spyOn(service['joinedPlayersByGameId'], 'get').mockImplementationOnce(() => {
            return [fakePlayer];
        });
        const indexOfSpy = jest.spyOn(Array.prototype, 'indexOf');
        const spliceSpy = jest.spyOn(Array.prototype, 'splice');
        const setSpy = jest.spyOn(service['joinedPlayersByGameId'], 'set');
        service.cancelJoiningByPlayerId(fakePlayer.playerId, fakePlayerPayload.gameId);
        expect(getSpy).toHaveBeenCalled();
        expect(setSpy).toHaveBeenCalled();
        expect(indexOfSpy).toHaveBeenCalled();
        expect(spliceSpy).toHaveBeenCalled();
    });

    it('cancelJoiningByPlayerId should not delete the player from joinedPlayerNamesByGameId if it does not exist', () => {
        const setSpy = jest.spyOn(service['joinedPlayersByGameId'], 'set');
        service.cancelJoiningByPlayerId(fakePlayerPayload.gameId, 'wrongName');
        expect(setSpy).not.toHaveBeenCalled();
    });

    it('cancelAllJoining should  call cancelJoiningByPlayerName for each player', () => {
        const getSpy = jest.spyOn(service['joinedPlayersByGameId'], 'get').mockImplementationOnce(() => {
            return [fakePlayer];
        });
        service['cancelJoiningByPlayerName'] = jest.fn();
        service.cancelAllJoining(fakePlayerPayload.gameId, server);
        expect(getSpy).toHaveBeenCalled();
        expect(service['cancelJoiningByPlayerName']).toHaveBeenCalled();
    });
    it('cancelAllJoining should not call  cancelJoiningByPlayerName for each player (joinedPlayersByGameId undefined)', () => {
        const getSpy = jest.spyOn(service['joinedPlayersByGameId'], 'get').mockImplementationOnce(() => {
            return undefined;
        });
        service['cancelJoiningByPlayerName'] = jest.fn();
        service.cancelAllJoining(fakePlayerPayload.gameId, server);
        expect(getSpy).toHaveBeenCalled();
        expect(service['cancelJoiningByPlayerName']).not.toHaveBeenCalled();
    });

    it('getGameIdByPlayerId should return the game id of the player', () => {
        service['joinedPlayersByGameId'].set(fakePlayerPayload.gameId, [fakePlayer]);
        const result = service.getGameIdByPlayerId(fakePlayer.playerId);
        expect(result).toEqual(fakePlayerPayload.gameId);
    });

    it('deleteJoinedPlayerByPlayerId should delete the player from joinedPlayerNamesByGameId if it exists', () => {
        const getSpy = jest.spyOn(service['joinedPlayersByGameId'], 'get').mockImplementationOnce(() => {
            return [fakePlayer];
        });
        const indexOfSpy = jest.spyOn(Array.prototype, 'indexOf');
        const spliceSpy = jest.spyOn(Array.prototype, 'splice');
        const setSpy = jest.spyOn(service['joinedPlayersByGameId'], 'set');
        service.deleteJoinedPlayerByPlayerId(fakePlayer.playerId, fakePlayerPayload.gameId);
        expect(getSpy).toHaveBeenCalled();
        expect(setSpy).toHaveBeenCalled();
        expect(indexOfSpy).toHaveBeenCalled();
        expect(spliceSpy).toHaveBeenCalled();
    });

    it('deleteJoinedPlayerByPlayerId should not delete the player from joinedPlayerNamesByGameId if it does not exist', () => {
        const setSpy = jest.spyOn(service['joinedPlayersByGameId'], 'set');
        service.deleteJoinedPlayerByPlayerId(fakePlayerPayload.gameId, 'wrongName');
        expect(setSpy).not.toHaveBeenCalled();
    });

    it('resetAllTopTime should call resetAllTopTime of gameService and emit RequestReload', async () => {
        const resetAllTopTimeSpy = jest.spyOn(gameService, 'resetAllTopTimes');
        await service.resetAllTopTime(server);
        expect(resetAllTopTimeSpy).toHaveBeenCalled();
        assert.calledOnce(server.emit);
        assert.calledWith(server.emit, GameCardEvents.RequestReload);
    });

    it('deleteJoinedPlayersByGameId should delete the game from joinedPlayerNamesByGameId', () => {
        service['joinedPlayersByGameId'].set(fakePlayerPayload.gameId, [fakePlayer]);
        service.deleteJoinedPlayersByGameId(fakePlayerPayload.gameId);
        expect(service['joinedPlayersByGameId'].get(fakePlayerPayload.gameId)).toBeUndefined();
    });

    it('resetTopTime should call resetTopTime of gameService and emit RequestReload', async () => {
        const resetTopTimeSpy = jest.spyOn(gameService, 'resetTopTimesGameById');
        await service.resetTopTime(fakePlayerPayload.gameId, server);
        expect(resetTopTimeSpy).toHaveBeenCalled();
        assert.calledOnce(server.emit);
        assert.calledWith(server.emit, GameCardEvents.RequestReload);
    });

    it('updateTopBestTime should call updateTopTimesGameById, getTopTimesGameById of gameService and emit RequestReload', async () => {
        const updateTopTimesGameByIdSpy = jest.spyOn(gameService, 'updateTopTimesGameById');
        const getTopTimesGameByIdSpy = jest.spyOn(gameService, 'getTopTimesGameById').mockResolvedValueOnce(defaultBestTimes);
        const verifyIfGameExistsSpy = jest.spyOn(gameService, 'verifyIfGameExists').mockResolvedValueOnce(true);
        service['insertNewTopTime'] = jest.fn();
        service['sendNewTopTimeMessage'] = jest.fn();
        await service.updateTopBestTime(fakeRoom, fakePlayer.name, server);
        expect(updateTopTimesGameByIdSpy).toHaveBeenCalled();
        expect(getTopTimesGameByIdSpy).toHaveBeenCalled();
        expect(service['insertNewTopTime']).toHaveBeenCalled();
        expect(service['sendNewTopTimeMessage']).toHaveBeenCalled();
        expect(verifyIfGameExistsSpy).toHaveBeenCalled();
        assert.calledOnce(server.emit);
        assert.calledWith(server.emit, GameCardEvents.RequestReload);
    });

    it('updateTopBestTime should not call updateTopTimesGameById, getTopTimesGameById of gameService if the game does not exist', async () => {
        const updateTopTimesGameByIdSpy = jest.spyOn(gameService, 'updateTopTimesGameById');
        const getTopTimesGameByIdSpy = jest.spyOn(gameService, 'getTopTimesGameById').mockResolvedValueOnce(defaultBestTimes);
        const verifyIfGameExistsSpy = jest.spyOn(gameService, 'verifyIfGameExists').mockResolvedValueOnce(false);
        service['insertNewTopTime'] = jest.fn();
        service['sendNewTopTimeMessage'] = jest.fn();
        await service.updateTopBestTime(fakeRoom, fakePlayer.name, server);
        expect(updateTopTimesGameByIdSpy).not.toHaveBeenCalled();
        expect(getTopTimesGameByIdSpy).not.toHaveBeenCalled();
        expect(service['insertNewTopTime']).not.toHaveBeenCalled();
        expect(service['sendNewTopTimeMessage']).not.toHaveBeenCalled();
        expect(verifyIfGameExistsSpy).toHaveBeenCalled();
        assert.notCalled(server.emit);
    });

    it('cancelJoiningByPlayerName should call getPlayerIdByPlayerName emit PlayerRefused and UndoRoomCreation events', () => {
        service['getPlayerIdByPlayerName'] = jest.fn().mockReturnValueOnce(fakePlayer.playerId);
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(PlayerEvents.PlayerRefused);
            },
        } as BroadcastOperator<unknown, unknown>);
        service['cancelJoiningByPlayerName'](fakePlayer.name, fakePlayerPayload.gameId, server);
        expect(service['getPlayerIdByPlayerName']).toHaveBeenCalled();
        assert.calledOnce(server.emit);
        assert.calledWith(server.emit, RoomEvents.UndoRoomCreation);
    });

    it('cancelJoiningByPlayerName should not call getPlayerIdByPlayerName if the player does not exist', () => {
        service['getPlayerIdByPlayerName'] = jest.fn().mockReturnValueOnce(undefined);
        service['cancelJoiningByPlayerName'](fakePlayer.name, fakePlayerPayload.gameId, server);
        expect(service['getPlayerIdByPlayerName']).toHaveBeenCalled();
    });

    it('getPlayerIdByPlayerName should return the player id of the player', () => {
        service['joinedPlayersByGameId'].set(fakePlayerPayload.gameId, [fakePlayer]);
        const result = service['getPlayerIdByPlayerName'](fakePlayerPayload.gameId, fakePlayer.name);
        expect(result).toEqual(fakePlayer.playerId);
    });

    it('getPlayerIdByPlayerName should return undefined if the player does not exist', () => {
        const result = service['getPlayerIdByPlayerName'](fakePlayerPayload.gameId, 'wrongName');
        expect(result).toBeUndefined();
    });

    it('insertNewTopTime should insert the new top time in the best times', () => {
        const topTimesIndex = service['insertNewTopTime']('newPlayer', 3, defaultBestTimes);
        expect(topTimesIndex).toEqual(1);
    });

    it('sendNewTopTimeMessage should emit NewTopTime event', () => {
        service['sendNewTopTimeMessage']({} as NewRecord, server);
        assert.calledOnce(server.emit);
        assert.calledWith(server.emit, MessageEvents.LocalMessage);
    });
});
