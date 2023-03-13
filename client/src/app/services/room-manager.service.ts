import { Injectable, OnDestroy } from '@angular/core';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { AcceptedPlayerByRoomId, GameEvents, PlayerNameAvailability, RoomAvailability, WaitingPlayerNameList } from '@common/game-interfaces';
import { BehaviorSubject, Subject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class RoomManagerService implements OnDestroy {
    private joinedPlayerNames: BehaviorSubject<WaitingPlayerNameList>;
    private isPlayerNameTaken: Subject<PlayerNameAvailability>;
    private oneVsOneRoomsAvailabilityByGameId: BehaviorSubject<RoomAvailability>;
    private acceptedPlayerByRoom: BehaviorSubject<AcceptedPlayerByRoomId>;
    private roomId: Subject<string>;

    constructor(private clientSocket: ClientSocketService) {
        this.isPlayerNameTaken = new Subject<PlayerNameAvailability>();
        this.roomId = new Subject<string>();
        this.acceptedPlayerByRoom = new BehaviorSubject<AcceptedPlayerByRoomId>({
            roomId: '',
            playerName: '',
        });
        this.joinedPlayerNames = new BehaviorSubject<WaitingPlayerNameList>({
            gameId: '',
            playerNamesList: [],
        });
        this.oneVsOneRoomsAvailabilityByGameId = new BehaviorSubject<RoomAvailability>({
            gameId: '',
            isAvailableToJoin: false,
        });
    }

    get joinedPlayerNamesByGameId$() {
        return this.joinedPlayerNames.asObservable();
    }

    get isNameTaken$() {
        return this.isPlayerNameTaken.asObservable();
    }

    get roomId$() {
        return this.roomId.asObservable();
    }

    get oneVsOneRoomsAvailabilityByRoomId$() {
        return this.oneVsOneRoomsAvailabilityByGameId.asObservable();
    }

    get acceptedPlayerByRoom$() {
        return this.acceptedPlayerByRoom.asObservable();
    }

    createSoloRoom(gameId: string, playerName: string) {
        this.clientSocket.send(GameEvents.CreateSoloGame, { gameId, playerName });
    }

    createOneVsOneRoom(id: string): void {
        this.clientSocket.send(GameEvents.CreateOneVsOneRoom, { gameId: id });
    }

    updateRoomOneVsOneAvailability(gameId: string): void {
        this.clientSocket.send(GameEvents.UpdateRoomOneVsOneAvailability, gameId);
    }

    checkRoomOneVsOneAvailability(gameId: string): void {
        this.clientSocket.send(GameEvents.CheckRoomOneVsOneAvailability, gameId);
    }

    deleteCreatedOneVsOneRoom(gameId: string) {
        this.clientSocket.send(GameEvents.DeleteCreatedOneVsOneRoom, gameId);
    }

    updateWaitingPlayerNameList(gameId: string, playerName: string): void {
        this.clientSocket.send(GameEvents.UpdateWaitingPlayerNameList, { gameId, playerName });
    }

    isPlayerNameIsAlreadyTaken(gameId: string, playerName: string): void {
        this.clientSocket.send(GameEvents.CheckIfPlayerNameIsAvailable, { gameId, playerName });
    }

    refusePlayer(gameId: string, playerName: string): void {
        this.clientSocket.send(GameEvents.RefusePlayer, { gameId, playerName });
    }

    acceptPlayer(gameId: string, roomId: string, playerNameCreator: string) {
        this.clientSocket.send(GameEvents.AcceptPlayer, { gameId, roomId, playerNameCreator });
    }

    cancelJoining(roomId: string, playerName: string): void {
        this.clientSocket.send(GameEvents.CancelJoining, { roomId, playerName });
    }

    disconnect(): void {
        this.clientSocket.disconnect();
    }

    handleRoomEvents(): void {
        this.clientSocket.connect();

        this.clientSocket.on(GameEvents.RoomSoloCreated, (roomId: string) => {
            this.roomId.next(roomId);
        });

        this.clientSocket.on(GameEvents.RoomOneVsOneAvailable, (availabilityData: RoomAvailability) => {
            this.oneVsOneRoomsAvailabilityByGameId.next(availabilityData);
        });

        this.clientSocket.on(GameEvents.OneVsOneRoomDeleted, (availabilityData: RoomAvailability) => {
            this.oneVsOneRoomsAvailabilityByGameId.next(availabilityData);
        });

        this.clientSocket.on(GameEvents.UpdateWaitingPlayerNameList, (waitingPlayerNameList: WaitingPlayerNameList) => {
            this.joinedPlayerNames.next(waitingPlayerNameList);
        });

        this.clientSocket.on(GameEvents.PlayerNameTaken, (playerNameAvailability: PlayerNameAvailability) => {
            this.isPlayerNameTaken.next(playerNameAvailability);
        });

        this.clientSocket.on(GameEvents.RoomOneVsOneCreated, (roomId: string) => {
            this.roomId.next(roomId);
        });

        this.clientSocket.on(GameEvents.PlayerAccepted, (acceptedPlayer: AcceptedPlayerByRoomId) => {
            this.acceptedPlayerByRoom.next(acceptedPlayer);
        });
    }

    ngOnDestroy(): void {
        this.disconnect();
    }
}
