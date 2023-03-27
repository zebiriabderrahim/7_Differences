import { Injectable, OnDestroy } from '@angular/core';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { GameEvents, playerData, PlayerNameAvailability, RoomAvailability } from '@common/game-interfaces';
import { BehaviorSubject, Subject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class RoomManagerService implements OnDestroy {
    private joinedPlayerNames: Subject<string[]>;
    private isPlayerNameTaken: Subject<PlayerNameAvailability>;
    private oneVsOneRoomsAvailabilityByGameId: Subject<RoomAvailability>;
    private isPlayerAccepted: BehaviorSubject<boolean>;
    private refusedPlayerId: Subject<string>;
    private createdRoomId: Subject<string>;
    private deletedGameId: Subject<string>;
    private isGameCardsNeedToBeReloaded: BehaviorSubject<boolean>;

    constructor(private readonly clientSocket: ClientSocketService) {
        this.isPlayerNameTaken = new Subject<PlayerNameAvailability>();
        this.createdRoomId = new Subject<string>();
        this.isPlayerAccepted = new BehaviorSubject<boolean>(false);
        this.joinedPlayerNames = new Subject<string[]>();
        this.oneVsOneRoomsAvailabilityByGameId = new Subject<RoomAvailability>();
        this.deletedGameId = new Subject<string>();
        this.refusedPlayerId = new Subject<string>();
        this.isGameCardsNeedToBeReloaded = new BehaviorSubject<boolean>(false);
    }

    get joinedPlayerNamesByGameId$() {
        return this.joinedPlayerNames.asObservable();
    }

    get isNameTaken$() {
        return this.isPlayerNameTaken.asObservable();
    }

    get createdRoomId$() {
        return this.createdRoomId.asObservable();
    }

    get oneVsOneRoomsAvailabilityByRoomId$() {
        return this.oneVsOneRoomsAvailabilityByGameId.asObservable();
    }

    get roomId$() {
        return this.isPlayerAccepted.asObservable();
    }

    get deletedGameId$() {
        return this.deletedGameId.asObservable();
    }

    get refusedPlayerId$() {
        return this.refusedPlayerId.asObservable();
    }

    get isGameCardsNeedToBeReloaded$() {
        return this.isGameCardsNeedToBeReloaded.asObservable();
    }

    createSoloRoom(gameId: string, playerName: string) {
        const playerPayLoad = { gameId, playerName } as playerData;
        this.clientSocket.send(GameEvents.CreateSoloGame, playerPayLoad);
    }

    createOneVsOneRoom(gameId: string, playerName: string): void {
        const playerPayLoad = { gameId, playerName } as playerData;
        this.clientSocket.send(GameEvents.CreateOneVsOneRoom, playerPayLoad);
    }

    updateRoomOneVsOneAvailability(gameId: string): void {
        this.clientSocket.send(GameEvents.UpdateRoomOneVsOneAvailability, gameId);
    }

    checkRoomOneVsOneAvailability(gameId: string): void {
        this.clientSocket.send(GameEvents.CheckRoomOneVsOneAvailability, gameId);
    }

    deleteCreatedOneVsOneRoom(roomId: string) {
        this.clientSocket.send(GameEvents.DeleteCreatedOneVsOneRoom, roomId);
    }

    getJoinedPlayerNames(gameId: string): void {
        this.clientSocket.send(GameEvents.GetJoinedPlayerNames, gameId);
    }

    updateWaitingPlayerNameList(gameId: string, playerName: string): void {
        const playerPayLoad = { gameId, playerName } as playerData;
        this.clientSocket.send(GameEvents.UpdateWaitingPlayerNameList, playerPayLoad);
    }

    isPlayerNameIsAlreadyTaken(gameId: string, playerName: string): void {
        const playerPayLoad = { gameId, playerName } as playerData;
        this.clientSocket.send(GameEvents.CheckIfPlayerNameIsAvailable, playerPayLoad);
    }

    refusePlayer(gameId: string, playerName: string): void {
        const playerPayLoad = { gameId, playerName } as playerData;
        this.clientSocket.send(GameEvents.RefusePlayer, playerPayLoad);
    }

    acceptPlayer(gameId: string, roomId: string, playerName: string) {
        this.clientSocket.send(GameEvents.AcceptPlayer, { gameId, roomId, playerName });
    }

    cancelJoining(gameId: string): void {
        this.clientSocket.send(GameEvents.CancelJoining, gameId);
    }

    gameCardCreated() {
        this.clientSocket.send(GameEvents.GameCardCreated);
    }

    gameCardDeleted(gameId: string) {
        this.clientSocket.send(GameEvents.DeleteGameCard, gameId);
    }

    getSocketId(): string {
        return this.clientSocket.socket.id;
    }

    disconnect(): void {
        this.clientSocket.disconnect();
    }

    handleRoomEvents(): void {
        this.clientSocket.on(GameEvents.RoomSoloCreated, (roomId: string) => {
            this.createdRoomId.next(roomId);
        });

        this.clientSocket.on(GameEvents.RoomOneVsOneAvailable, (availabilityData: RoomAvailability) => {
            this.oneVsOneRoomsAvailabilityByGameId.next(availabilityData);
        });

        this.clientSocket.on(GameEvents.OneVsOneRoomDeleted, (availabilityData: RoomAvailability) => {
            this.oneVsOneRoomsAvailabilityByGameId.next(availabilityData);
        });

        this.clientSocket.on(GameEvents.WaitingPlayerNameListUpdated, (waitingPlayerNameList: string[]) => {
            this.joinedPlayerNames.next(waitingPlayerNameList);
        });

        this.clientSocket.on(GameEvents.PlayerNameTaken, (playerNameAvailability: PlayerNameAvailability) => {
            this.isPlayerNameTaken.next(playerNameAvailability);
        });

        this.clientSocket.on(GameEvents.RoomOneVsOneCreated, (roomId: string) => {
            this.createdRoomId.next(roomId);
        });

        this.clientSocket.on(GameEvents.PlayerAccepted, (isAccepted: boolean) => {
            this.isPlayerAccepted.next(isAccepted);
        });

        this.clientSocket.on(GameEvents.GameCardDeleted, (gameId: string) => {
            this.deletedGameId.next(gameId);
        });

        this.clientSocket.on(GameEvents.PlayerRefused, (playerId: string) => {
            this.refusedPlayerId.next(playerId);
        });

        this.clientSocket.on(GameEvents.RequestGameCardsUpdate, () => {
            this.isGameCardsNeedToBeReloaded.next(true);
        });
    }

    ngOnDestroy(): void {
        this.disconnect();
    }
}
