import { Injectable, OnDestroy } from '@angular/core';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { GameCardEvents, PlayerEvents, RoomEvents } from '@common/enums';
import { LimitedGameDetails, GameHistory, HistoryEvents, playerData, PlayerNameAvailability, RoomAvailability } from '@common/game-interfaces';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class RoomManagerService implements OnDestroy {
    gameHistory: GameHistory[];
    private joinedPlayerNames: Subject<string[]>;
    private isPlayerNameTaken: Subject<PlayerNameAvailability>;
    private oneVsOneRoomsAvailabilityByGameId: Subject<RoomAvailability>;
    private isPlayerAccepted: Subject<boolean>;
    private refusedPlayerId: Subject<string>;
    private createdRoomId: Subject<string>;
    private deletedGameId: Subject<string>;
    private isReloadNeeded: Subject<boolean>;
    private isLimitedCoopRoomAvailable: Subject<boolean>;

    constructor(private readonly clientSocket: ClientSocketService) {
        this.isPlayerNameTaken = new Subject<PlayerNameAvailability>();
        this.createdRoomId = new Subject<string>();
        this.isPlayerAccepted = new Subject<boolean>();
        this.joinedPlayerNames = new Subject<string[]>();
        this.oneVsOneRoomsAvailabilityByGameId = new Subject<RoomAvailability>();
        this.deletedGameId = new Subject<string>();
        this.gameHistory = [];
        this.refusedPlayerId = new Subject<string>();
        this.isReloadNeeded = new Subject<boolean>();
        this.isLimitedCoopRoomAvailable = new Subject<boolean>();
        this.connect();
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

    get isReloadNeeded$() {
        return this.isReloadNeeded.asObservable();
    }

    get isLimitedCoopRoomAvailable$() {
        return this.isLimitedCoopRoomAvailable.asObservable();
    }

    createSoloRoom(gameId: string, playerName: string) {
        const playerPayLoad = { gameId, playerName } as playerData;
        this.clientSocket.send(RoomEvents.CreateClassicSoloRoom, playerPayLoad);
    }

    createOneVsOneRoom(gameId: string, playerName: string): void {
        const playerPayLoad = { gameId, playerName } as playerData;
        this.clientSocket.send(RoomEvents.CreateOneVsOneRoom, playerPayLoad);
    }

    createLimitedRoom(gameDetails: LimitedGameDetails): void {
        this.clientSocket.send(RoomEvents.CreateSoloLimitedRoom, gameDetails);
    }

    updateRoomOneVsOneAvailability(gameId: string): void {
        this.clientSocket.send(RoomEvents.UpdateRoomOneVsOneAvailability, gameId);
    }

    checkRoomOneVsOneAvailability(gameId: string): void {
        this.clientSocket.send(RoomEvents.CheckRoomOneVsOneAvailability, gameId);
    }

    deleteCreatedOneVsOneRoom(roomId: string) {
        this.clientSocket.send(RoomEvents.DeleteCreatedOneVsOneRoom, roomId);
    }

    deleteCreatedCoopRoom(roomId: string) {
        this.clientSocket.send(RoomEvents.DeleteCreatedCoopRoom, roomId);
    }

    getJoinedPlayerNames(gameId: string): void {
        this.clientSocket.send(PlayerEvents.GetJoinedPlayerNames, gameId);
    }

    updateWaitingPlayerNameList(gameId: string, playerName: string): void {
        const playerPayLoad = { gameId, playerName } as playerData;
        this.clientSocket.send(PlayerEvents.UpdateWaitingPlayerNameList, playerPayLoad);
    }

    isPlayerNameIsAlreadyTaken(gameId: string, playerName: string): void {
        const playerPayLoad = { gameId, playerName } as playerData;
        this.clientSocket.send(PlayerEvents.CheckIfPlayerNameIsAvailable, playerPayLoad);
    }

    refusePlayer(gameId: string, playerName: string): void {
        const playerPayLoad = { gameId, playerName } as playerData;
        this.clientSocket.send(PlayerEvents.RefusePlayer, playerPayLoad);
    }

    acceptPlayer(gameId: string, roomId: string, playerName: string) {
        this.clientSocket.send(PlayerEvents.AcceptPlayer, { gameId, roomId, playerName });
    }

    cancelJoining(gameId: string): void {
        this.clientSocket.send(PlayerEvents.CancelJoining, gameId);
    }

    checkIfAnyCoopRoomExists(gameDetails: LimitedGameDetails) {
        this.clientSocket.send(RoomEvents.CheckIfAnyCoopRoomExists, gameDetails);
    }

    gameCardCreated() {
        this.clientSocket.send(GameCardEvents.GameCardCreated);
    }

    gameCardDeleted(gameId: string) {
        this.clientSocket.send(GameCardEvents.GameCardDeleted, gameId);
    }

    allGamesDeleted() {
        this.clientSocket.send(GameCardEvents.AllGamesDeleted);
    }

    resetTopTime(gameId: string) {
        this.clientSocket.send(GameCardEvents.ResetTopTime, gameId);
    }

    resetAllTopTimes() {
        this.clientSocket.send(GameCardEvents.ResetAllTopTimes);
    }

    gameConstantsUpdated() {
        this.clientSocket.send(GameCardEvents.GameConstantsUpdated);
    }

    connect(): void {
        this.clientSocket.connect();
    }

    getSocketId(): string {
        return this.clientSocket.socket.id;
    }

    disconnect(): void {
        this.clientSocket.disconnect();
    }

    removeAllListeners() {
        this.clientSocket.socket.off();
    }

    handleRoomEvents(): void {
        this.clientSocket.on(RoomEvents.RoomSoloCreated, (roomId: string) => {
            this.createdRoomId.next(roomId);
        });

        this.clientSocket.on(RoomEvents.RoomOneVsOneCreated, (roomId: string) => {
            this.createdRoomId.next(roomId);
        });

        this.clientSocket.on(RoomEvents.RoomLimitedCreated, (roomId: string) => {
            this.createdRoomId.next(roomId);
        });

        this.clientSocket.on(RoomEvents.RoomOneVsOneAvailable, (availabilityData: RoomAvailability) => {
            this.oneVsOneRoomsAvailabilityByGameId.next(availabilityData);
        });

        this.clientSocket.on(RoomEvents.OneVsOneRoomDeleted, (availabilityData: RoomAvailability) => {
            this.oneVsOneRoomsAvailabilityByGameId.next(availabilityData);
        });

        this.clientSocket.on(RoomEvents.LimitedCoopRoomJoined, () => {
            this.isLimitedCoopRoomAvailable.next(true);
        });

        this.clientSocket.on(PlayerEvents.WaitingPlayerNameListUpdated, (waitingPlayerNameList: string[]) => {
            this.joinedPlayerNames.next(waitingPlayerNameList);
        });

        this.clientSocket.on(PlayerEvents.PlayerNameTaken, (playerNameAvailability: PlayerNameAvailability) => {
            this.isPlayerNameTaken.next(playerNameAvailability);
        });

        this.clientSocket.on(PlayerEvents.PlayerAccepted, (isAccepted: boolean) => {
            this.isPlayerAccepted.next(isAccepted);
        });

        this.clientSocket.on(PlayerEvents.PlayerRefused, (playerId: string) => {
            this.refusedPlayerId.next(playerId);
        });

        this.clientSocket.on(GameCardEvents.GameDeleted, (gameId: string) => {
            this.deletedGameId.next(gameId);
        });
        this.clientSocket.on(GameCardEvents.RequestReload, () => {
            this.isReloadNeeded.next(true);
        });

        this.clientSocket.on(HistoryEvents.EntryAdded, (gameHistory: GameHistory[]) => {
            console.log('gameHistory', gameHistory);
            this.gameHistory = gameHistory;
        });
    }
    ngOnDestroy(): void {
        this.clientSocket.disconnect();
    }
}
