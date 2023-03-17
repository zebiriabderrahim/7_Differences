import { TestBed } from '@angular/core/testing';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { SocketTestHelper } from '@app/services/client-socket-service/client-socket.service.spec';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { GameEvents } from '@common/game-interfaces';
import { Socket } from 'socket.io-client';

describe('RoomManagerService', () => {
    let service: RoomManagerService;
    let clientSocketSpy: jasmine.SpyObj<ClientSocketService>;
    let mockGameId: string;
    let mockPlayerName: string;
    let socketHelper: SocketTestHelper;

    beforeEach(() => {
        clientSocketSpy = jasmine.createSpyObj('ClientSocketService', ['disconnect', 'send', 'connect', 'on']);
        TestBed.configureTestingModule({
            providers: [{ provide: ClientSocketService, useValue: clientSocketSpy }],
        });
        service = TestBed.inject(RoomManagerService);
        mockGameId = 'mockGameId';
        mockPlayerName = 'mockPlayerName';
        socketHelper = new SocketTestHelper();
        clientSocketSpy.socket = socketHelper as unknown as Socket;
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

    it('roomId$ should return roomId asObservable', () => {
        expect(service.roomId$).toEqual(service['roomId'].asObservable());
    });

    it('oneVsOneRoomsAvailabilityByRoomId$ should return oneVsOneRoomsAvailabilityByGameId asObservable', () => {
        expect(service.oneVsOneRoomsAvailabilityByRoomId$).toEqual(service['oneVsOneRoomsAvailabilityByGameId'].asObservable());
    });

    it('acceptedPlayerByRoom$ should return acceptedPlayerByRoom asObservable', () => {
        expect(service.acceptedPlayerByRoom$).toEqual(service['acceptedPlayerByRoom'].asObservable());
    });

    it('createSoloRoom should call clientSocket.send with CreateSoloGame and gameId and playerName', () => {
        service.createSoloRoom(mockGameId, mockPlayerName);
        expect(clientSocketSpy.send).toHaveBeenCalledWith(GameEvents.CreateSoloGame, { gameId: mockGameId, playerName: mockPlayerName });
    });

    it('createOneVsOneRoom should call clientSocket.send with CreateOneVsOneRoom and gameId', () => {
        service.createOneVsOneRoom(mockGameId);
        expect(clientSocketSpy.send).toHaveBeenCalledWith(GameEvents.CreateOneVsOneRoom, { gameId: mockGameId });
    });

    it('updateRoomOneVsOneAvailability should call clientSocket.send with UpdateRoomOneVsOneAvailability and gameId', () => {
        service.updateRoomOneVsOneAvailability(mockGameId);
        expect(clientSocketSpy.send).toHaveBeenCalledWith(GameEvents.UpdateRoomOneVsOneAvailability, mockGameId);
    });

    it('checkRoomOneVsOneAvailability should call clientSocket.send with CheckRoomOneVsOneAvailability and gameId', () => {
        service.checkRoomOneVsOneAvailability(mockGameId);
        expect(clientSocketSpy.send).toHaveBeenCalledWith(GameEvents.CheckRoomOneVsOneAvailability, mockGameId);
    });

    it('deleteCreatedOneVsOneRoom should call clientSocket.send with DeleteCreatedRoom and gameId', () => {
        service.deleteCreatedOneVsOneRoom(mockGameId);
        expect(clientSocketSpy.send).toHaveBeenCalledWith(GameEvents.DeleteCreatedOneVsOneRoom, mockGameId);
    });

    it('updateWaitingPlayerNameList should call clientSocket.send with UpdateWaitingPlayerNameList and gameId and playerName', () => {
        service.updateWaitingPlayerNameList(mockGameId, mockPlayerName);
        expect(clientSocketSpy.send).toHaveBeenCalledWith(GameEvents.UpdateWaitingPlayerNameList, { gameId: mockGameId, playerName: mockPlayerName });
    });

    it('isPlayerNameIsAlreadyTaken should call clientSocket.send with CheckIfPlayerNameIsAvailable and gameId and playerName', () => {
        service.isPlayerNameIsAlreadyTaken(mockGameId, mockPlayerName);
        expect(clientSocketSpy.send).toHaveBeenCalledWith(GameEvents.CheckIfPlayerNameIsAvailable, {
            gameId: mockGameId,
            playerName: mockPlayerName,
        });
    });

    it('refusePlayer should call clientSocket.send with RefusePlayer and gameId and playerName', () => {
        service.refusePlayer(mockGameId, mockPlayerName);
        expect(clientSocketSpy.send).toHaveBeenCalledWith(GameEvents.RefusePlayer, { gameId: mockGameId, playerName: mockPlayerName });
    });

    it('acceptPlayer should call clientSocket.send with AcceptPlayer and roomId, playerName and creator name', () => {
        const mockRoomId = 'super-id';
        service.acceptPlayer(mockGameId, mockRoomId, mockPlayerName);
        expect(clientSocketSpy.send).toHaveBeenCalledWith(GameEvents.AcceptPlayer, {
            gameId: mockGameId,
            roomId: mockRoomId,
            playerNameCreator: mockPlayerName,
        });
    });

    it('cancelJoining should call clientSocket.send with CancelJoining and roomId and playerName', () => {
        service.cancelJoining(mockGameId, mockPlayerName);
        expect(clientSocketSpy.send).toHaveBeenCalledWith(GameEvents.CancelJoining, { roomId: mockGameId, playerName: mockPlayerName });
    });

    it('disconnect should call clientSocket.disconnect', () => {
        service.disconnect();
        expect(clientSocketSpy.disconnect).toHaveBeenCalled();
    });

    it('handleRoomEvents should connect socket and set on for GameEvents related to room', () => {
        service.handleRoomEvents();
        expect(clientSocketSpy.connect).toHaveBeenCalled();
        expect(clientSocketSpy.on).toHaveBeenCalledWith(GameEvents.RoomSoloCreated, jasmine.any(Function));
        expect(clientSocketSpy.on).toHaveBeenCalledWith(GameEvents.RoomOneVsOneAvailable, jasmine.any(Function));
        expect(clientSocketSpy.on).toHaveBeenCalledWith(GameEvents.OneVsOneRoomDeleted, jasmine.any(Function));
        expect(clientSocketSpy.on).toHaveBeenCalledWith(GameEvents.UpdateWaitingPlayerNameList, jasmine.any(Function));
        expect(clientSocketSpy.on).toHaveBeenCalledWith(GameEvents.PlayerNameTaken, jasmine.any(Function));
        expect(clientSocketSpy.on).toHaveBeenCalledWith(GameEvents.RoomOneVsOneCreated, jasmine.any(Function));
        expect(clientSocketSpy.on).toHaveBeenCalledWith(GameEvents.PlayerAccepted, jasmine.any(Function));
    });

    it('ngOnDestroy should call disconnect', () => {
        service.ngOnDestroy();
        expect(clientSocketSpy.disconnect).toHaveBeenCalled();
    });
});
