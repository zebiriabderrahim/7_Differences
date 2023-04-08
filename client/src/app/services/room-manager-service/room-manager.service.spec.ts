import { TestBed } from '@angular/core/testing';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { SocketTestHelper } from '@app/services/client-socket-service/client-socket.service.spec';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { GameCardEvents, GameModes, PlayerEvents, RoomEvents } from '@common/enums';
import { LimitedGameDetails } from '@common/game-interfaces';
import { Socket } from 'socket.io-client';

class SocketClientServiceMock extends ClientSocketService {
    override connect() {
        return;
    }
    override disconnect() {
        return;
    }
}

describe('RoomManagerService', () => {
    let service: RoomManagerService;
    let mockGameId: string;
    let mockRoomId: string;
    let mockPlayerName: string;
    let mockGameMode: GameModes;
    let mockLimitedGameDetails: LimitedGameDetails;
    let socketHelper: SocketTestHelper;
    let socketServiceMock: SocketClientServiceMock;

    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketHelper as unknown as Socket;
        mockLimitedGameDetails = {
            playerName: mockPlayerName,
            gameMode: mockGameMode,
        };

        TestBed.configureTestingModule({
            providers: [{ provide: ClientSocketService, useValue: socketServiceMock }],
        });
        service = TestBed.inject(RoomManagerService);
        mockGameId = 'mockGameId';
        mockPlayerName = 'mockPlayerName';
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('joinedPlayerNamesByGameId$ should return joinedPlayerNames asObservable', () => {
        expect(service.joinedPlayerNamesByGameId$).toEqual(service['joinedPlayerNames'].asObservable());
    });

    it('isNameTaken$ should return isPlayerNameTaken asObservable', () => {
        expect(service.isNameTaken$).toEqual(service['isPlayerNameTaken'].asObservable());
    });

    it('createdRoomId$ should return createdRoomId asObservable', () => {
        expect(service.createdRoomId$).toEqual(service['createdRoomId'].asObservable());
    });

    it('roomId$ should return isPlayerAccepted asObservable', () => {
        expect(service.roomId$).toEqual(service['isPlayerAccepted'].asObservable());
    });

    it('deletedGameId$ should return deletedGameId asObservable', () => {
        expect(service.deletedGameId$).toEqual(service['deletedGameId'].asObservable());
    });

    it('oneVsOneRoomsAvailabilityByRoomId$ should return oneVsOneRoomsAvailabilityByGameId asObservable', () => {
        expect(service.oneVsOneRoomsAvailabilityByRoomId$).toEqual(service['oneVsOneRoomsAvailabilityByGameId'].asObservable());
    });

    it('refusedPlayerId$ should return refusedPlayerId asObservable', () => {
        expect(service.refusedPlayerId$).toEqual(service['refusedPlayerId'].asObservable());
    });

    it('createSoloRoom should call clientSocket.send with CreateSoloGame and gameId and playerName', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.createSoloRoom(mockGameId, mockPlayerName);
        expect(sendSpy).toHaveBeenCalledWith(RoomEvents.CreateClassicSoloRoom, { gameId: mockGameId, playerName: mockPlayerName });
    });

    it('createOneVsOneRoom should call clientSocket.send with CreateOneVsOneRoom and gameId', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.createOneVsOneRoom(mockGameId, mockPlayerName);
        expect(sendSpy).toHaveBeenCalledWith(RoomEvents.CreateOneVsOneRoom, { gameId: mockGameId, playerName: mockPlayerName });
    });

    it('createLimitedRoom should call clientSocket.send with CreateSoloLimitedRoom and gameId and playerName', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.createLimitedRoom(mockLimitedGameDetails);
        expect(sendSpy).toHaveBeenCalledWith(RoomEvents.CreateSoloLimitedRoom, { playerName: mockPlayerName, gameMode: mockGameMode });
    });

    it('deleteCreatedCoopRoom should call clientSocket.send with DeleteCreatedCoopRoom and roomId', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.deleteCreatedCoopRoom(mockRoomId);
        expect(sendSpy).toHaveBeenCalledWith(RoomEvents.DeleteCreatedCoopRoom, mockRoomId);
    });

    it('deleteCreatedCoopRoom should call clientSocket.send with DeleteCreatedCoopRoom and roomId', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.getJoinedPlayerNames(mockGameId);
        expect(sendSpy).toHaveBeenCalledWith(PlayerEvents.GetJoinedPlayerNames, mockGameId);
    });

    it('updateRoomOneVsOneAvailability should call clientSocket.send with UpdateRoomOneVsOneAvailability and gameId', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.updateRoomOneVsOneAvailability(mockGameId);
        expect(sendSpy).toHaveBeenCalledWith(RoomEvents.UpdateRoomOneVsOneAvailability, mockGameId);
    });

    it('checkRoomOneVsOneAvailability should call clientSocket.send with CheckRoomOneVsOneAvailability and gameId', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.checkRoomOneVsOneAvailability(mockGameId);
        expect(sendSpy).toHaveBeenCalledWith(RoomEvents.CheckRoomOneVsOneAvailability, mockGameId);
    });

    it('deleteCreatedOneVsOneRoom should call clientSocket.send with DeleteCreatedRoom and gameId', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.deleteCreatedOneVsOneRoom(mockGameId);
        expect(sendSpy).toHaveBeenCalledWith(RoomEvents.DeleteCreatedOneVsOneRoom, mockGameId);
    });

    it('updateWaitingPlayerNameList should call clientSocket.send with UpdateWaitingPlayerNameList and gameId and playerName', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.updateWaitingPlayerNameList(mockGameId, mockPlayerName);
        expect(sendSpy).toHaveBeenCalledWith(PlayerEvents.UpdateWaitingPlayerNameList, { gameId: mockGameId, playerName: mockPlayerName });
    });

    it('isPlayerNameIsAlreadyTaken should call clientSocket.send with CheckIfPlayerNameIsAvailable and gameId and playerName', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.isPlayerNameIsAlreadyTaken(mockGameId, mockPlayerName);
        expect(sendSpy).toHaveBeenCalledWith(PlayerEvents.CheckIfPlayerNameIsAvailable, {
            gameId: mockGameId,
            playerName: mockPlayerName,
        });
    });

    it('refusePlayer should call clientSocket.send with RefusePlayer and gameId and playerName', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.refusePlayer(mockGameId, mockPlayerName);
        expect(sendSpy).toHaveBeenCalledWith(PlayerEvents.RefusePlayer, { gameId: mockGameId, playerName: mockPlayerName });
    });

    it('acceptPlayer should call clientSocket.send with AcceptPlayer, gameId, roomId and playerName', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.acceptPlayer(mockGameId, mockRoomId, mockPlayerName);
        expect(sendSpy).toHaveBeenCalledWith(PlayerEvents.AcceptPlayer, {
            gameId: mockGameId,
            roomId: mockRoomId,
            playerName: mockPlayerName,
        });
    });

    it('cancelJoining should call clientSocket.send with CancelJoining and roomId and playerName', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.cancelJoining(mockGameId);
        expect(sendSpy).toHaveBeenCalledWith(PlayerEvents.CancelJoining, mockGameId);
    });

    it('checkIfAnyCoopRoomExists should call clientSocket.send with gameDetails', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.checkIfAnyCoopRoomExists(mockLimitedGameDetails);
        expect(sendSpy).toHaveBeenCalledWith(RoomEvents.CheckIfAnyCoopRoomExists, mockLimitedGameDetails);
    });

    it('disconnect should call clientSocket.disconnect', () => {
        const disconnectSpy = spyOn(socketServiceMock, 'disconnect');
        service.disconnect();
        expect(disconnectSpy).toHaveBeenCalled();
    });

    it('gameCardCreated should call clientSocket.send with GameCardCreated', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.gameCardCreated();
        expect(sendSpy).toHaveBeenCalledWith(GameCardEvents.GameCardCreated);
    });

    it('gameCardCreated should call clientSocket.send with GameCardCreated', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.gameCardDeleted(mockGameId);
        expect(sendSpy).toHaveBeenCalledWith(GameCardEvents.GameCardDeleted, mockGameId);
    });

    it('allGamesDeleted should call clientSocket.send with AllGamesDeleted', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.allGamesDeleted();
        expect(sendSpy).toHaveBeenCalledWith(GameCardEvents.AllGamesDeleted);
    });

    it('resetTopTime should call clientSocket.send with ResetTopTime', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.resetTopTime(mockGameId);
        expect(sendSpy).toHaveBeenCalledWith(GameCardEvents.ResetTopTime, mockGameId);
    });

    it('resetAllTopTimes should call clientSocket.send with ResetAllTopTimes', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.resetAllTopTimes();
        expect(sendSpy).toHaveBeenCalledWith(GameCardEvents.ResetAllTopTimes);
    });

    it('gameConstantsUpdated should call clientSocket.send with GameConstantsUpdated', () => {
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.gameConstantsUpdated();
        expect(sendSpy).toHaveBeenCalledWith(GameCardEvents.GameConstantsUpdated);
    });

    // it('handleRoomEvents should connect socket and set on for GameEvents related to room', () => {
    //     const connectSpy = spyOn(socketServiceMock, 'connect');
    //     const onSpy = spyOn(socketServiceMock, 'on');
    //     service.handleRoomEvents();
    //     expect(connectSpy).toHaveBeenCalled();
    //     expect(onSpy).toHaveBeenCalledWith(RoomEvents.RoomSoloCreated, jasmine.any(Function));
    //     expect(onSpy).toHaveBeenCalledWith(RoomEvents.RoomOneVsOneAvailable, jasmine.any(Function));
    //     expect(onSpy).toHaveBeenCalledWith(RoomEvents.OneVsOneRoomDeleted, jasmine.any(Function));
    //     expect(onSpy).toHaveBeenCalledWith(PlayerEvents.UpdateWaitingPlayerNameList, jasmine.any(Function));
    //     expect(onSpy).toHaveBeenCalledWith(PlayerEvents.PlayerNameTaken, jasmine.any(Function));
    //     expect(onSpy).toHaveBeenCalledWith(RoomEvents.RoomOneVsOneCreated, jasmine.any(Function));
    //     expect(onSpy).toHaveBeenCalledWith(PlayerEvents.PlayerAccepted, jasmine.any(Function));
    // });

    // it('should call roomId.next when GameEvents.RoomSoloCreated is received', () => {
    //     service.handleRoomEvents();
    //     const roomIdSpy = spyOn(service['roomId'], 'next');
    //     socketHelper.peerSideEmit(RoomEvents.RoomSoloCreated, mockGameId);
    //     expect(roomIdSpy).toHaveBeenCalledOnceWith(mockGameId);
    // });

    // it('should call oneVsOneRoomsAvailabilityByGameId.next when GameEvents.RoomOneVsOneAvailable is received', () => {
    //     service.handleRoomEvents();
    //     const mockAvailability = { gameId: mockGameId, isAvailableToJoin: true };
    //     const availabilitySpy = spyOn(service['oneVsOneRoomsAvailabilityByGameId'], 'next');
    //     socketHelper.peerSideEmit(GameEvents.RoomOneVsOneAvailable, mockAvailability);
    //     expect(availabilitySpy).toHaveBeenCalledOnceWith(mockAvailability);
    // });

    // it('should call oneVsOneRoomsAvailabilityByGameId.next when GameEvents.OneVsOneRoomDeleted is received', () => {
    //     service.handleRoomEvents();
    //     const mockAvailability = { gameId: mockGameId, isAvailableToJoin: true };
    //     const availabilitySpy = spyOn(service['oneVsOneRoomsAvailabilityByGameId'], 'next');
    //     socketHelper.peerSideEmit(GameEvents.OneVsOneRoomDeleted, mockAvailability);
    //     expect(availabilitySpy).toHaveBeenCalledOnceWith(mockAvailability);
    // });

    // it('should call joinedPlayerNames.next when GameEvents.UpdateWaitingPlayerNameList is received', () => {
    //     service.handleRoomEvents();
    //     const mockNameList = {
    //         gameId: mockGameId,
    //         playerNamesList: [],
    //     };
    //     const mockPlayerNamesList: [] = [];
    //     const joinedNextSpy = spyOn(service['joinedPlayerNames'], 'next');
    //     socketHelper.peerSideEmit(GameEvents.UpdateWaitingPlayerNameList, mockNameList);
    //     expect(joinedNextSpy).toHaveBeenCalledOnceWith(mockPlayerNamesList);
    // });

    // it('should call isPlayerNameTaken.next when GameEvents.PlayerNameTaken is received', () => {
    //     service.handleRoomEvents();
    //     const mockNameList = {
    //         gameId: mockGameId,
    //         isNameAvailable: true,
    //     };
    //     const isPlayerNextSpy = spyOn(service['isPlayerNameTaken'], 'next');
    //     socketHelper.peerSideEmit(GameEvents.PlayerNameTaken, mockNameList);
    //     expect(isPlayerNextSpy).toHaveBeenCalledOnceWith(mockNameList);
    // });

    // it('should call roomId.next when GameEvents.RoomOneVsOneCreated is received', () => {
    //     service.handleRoomEvents();
    //     const roomIdSpy = spyOn(service['roomId'], 'next');
    //     socketHelper.peerSideEmit(GameEvents.RoomOneVsOneCreated, mockGameId);
    //     expect(roomIdSpy).toHaveBeenCalledOnceWith(mockGameId);
    // });

    // it('should call roomId.next when GameEvents.PlayerAccepted is received', () => {
    //     service.handleRoomEvents();
    //     const mockAcceptedPlayer = {
    //         gameId: mockGameId,
    //         roomId: mockGameId,
    //         playerName: mockPlayerName,
    //     };

    //     const acceptedPlayerNextSpy = spyOn(service['acceptedPlayerByRoom'], 'next');
    //     socketHelper.peerSideEmit(GameEvents.PlayerAccepted, mockAcceptedPlayer);
    //     expect(acceptedPlayerNextSpy).toHaveBeenCalledOnceWith(mockAcceptedPlayer);
    // });

    // it('ngOnDestroy should call disconnect', () => {
    //     const disconnectSpy = spyOn(socketServiceMock, 'disconnect');
    //     service.ngOnDestroy();
    //     expect(disconnectSpy).toHaveBeenCalled();
    // });

    // it('gameIdOfRoomToBeDeleted$ should return gameIdOfRoomToBeDeleted as observable', () => {
    //     expect(service.gameIdOfRoomToBeDeleted$).toEqual(service['gameIdOfRoomToBeDeleted'].asObservable());
    // });

    // it('gameCardDeleted should call clientSocket.send with DeleteGameCard and gameId', () => {
    //     const sendSpy = spyOn(socketServiceMock, 'send');
    //     service.gameCardDeleted(mockGameId);
    //     expect(sendSpy).toHaveBeenCalledWith(GameEvents.gameCardDeleted, mockGameId);
    // });

    // it('should call gameIdOfRoomToBeDeleted.next when GameEvents.UndoCreation is received', () => {
    //     service.handleRoomEvents();
    //     const gameIdOfRoomToBeDeletedSpy = spyOn(service['gameIdOfRoomToBeDeleted'], 'next');
    //     socketHelper.peerSideEmit(GameEvents.UndoCreation, mockGameId);
    //     expect(gameIdOfRoomToBeDeletedSpy).toHaveBeenCalledOnceWith(mockGameId);
    // });

    // it('should call deletedGameId.next when GameEvents.GameCardDeleted is received', () => {
    //     service.handleRoomEvents();
    //     const deletedGameIdSpy = spyOn(service['deletedGameId'], 'next');
    //     socketHelper.peerSideEmit(GameEvents.GameCardDeleted, mockGameId);
    //     expect(deletedGameIdSpy).toHaveBeenCalledOnceWith(mockGameId);
    // });
});
