import { Injectable, OnDestroy } from '@angular/core';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { AcceptedPlayer, GameEvents, GameHistory, PlayerNameAvailability, RoomAvailability, WaitingPlayerNameList } from '@common/game-interfaces';
import { BehaviorSubject, Subject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class RoomManagerService implements OnDestroy {
    gameHistory: GameHistory[];
    private joinedPlayerNames: Subject<WaitingPlayerNameList>;
    private isPlayerNameTaken: Subject<PlayerNameAvailability>;
    private oneVsOneRoomsAvailabilityByGameId: Subject<RoomAvailability>;
    private acceptedPlayerByRoom: BehaviorSubject<AcceptedPlayer>;
    private roomId: Subject<string>;
    private gameIdOfRoomToBeDeleted: Subject<string>;
    private deletedGameId: Subject<string>;

    constructor(private readonly clientSocket: ClientSocketService) {
        this.isPlayerNameTaken = new Subject<PlayerNameAvailability>();
        this.roomId = new Subject<string>();
        this.acceptedPlayerByRoom = new BehaviorSubject<AcceptedPlayer>({
            gameId: '',
            roomId: '',
            playerName: '',
        });
        this.joinedPlayerNames = new Subject<WaitingPlayerNameList>();
        this.oneVsOneRoomsAvailabilityByGameId = new Subject<RoomAvailability>();
        this.gameIdOfRoomToBeDeleted = new Subject<string>();
        this.deletedGameId = new Subject<string>();
        this.gameHistory = [
            {
                date: '2023-09-01',
                startingHour: '00:00',
                duration: '00:00',
                gameMode: 'classic',
                player1: {
                    name: 'yomama',
                    isWinner: true,
                    isQuitter: false,
                },
            },
            {
                date: '2023-09-01',
                startingHour: '00:00',
                duration: '00:00',
                gameMode: 'classic',
                player1: {
                    name: 'yomama',
                    isWinner: true,
                    isQuitter: false,
                },
                player2: {
                    name: 'bloop',
                    isWinner: false,
                    isQuitter: true,
                },
            },
            {
                date: '2023-09-01',
                startingHour: '00:00',
                duration: '00:00',
                gameMode: 'classic',
                player1: {
                    name: 'yomama',
                    isWinner: true,
                    isQuitter: false,
                },
                player2: {
                    name: 'bloop',
                    isWinner: false,
                    isQuitter: true,
                },
            },
            {
                date: '2023-09-01',
                startingHour: '00:00',
                duration: '00:00',
                gameMode: 'classic',
                player1: {
                    name: 'yomama',
                    isWinner: true,
                    isQuitter: false,
                },
                player2: {
                    name: 'bloop',
                    isWinner: false,
                    isQuitter: true,
                },
            },
            {
                date: '2023-09-01',
                startingHour: '00:00',
                duration: '00:00',
                gameMode: 'classic',
                player1: {
                    name: 'yomama',
                    isWinner: true,
                    isQuitter: false,
                },
                player2: {
                    name: 'bloop',
                    isWinner: false,
                    isQuitter: true,
                },
            },
            {
                date: '2023-09-01',
                startingHour: '00:00',
                duration: '00:00',
                gameMode: 'classic',
                player1: {
                    name: 'yomama',
                    isWinner: true,
                    isQuitter: false,
                },
                player2: {
                    name: 'bloop',
                    isWinner: false,
                    isQuitter: true,
                },
            },
            {
                date: '2023-09-01',
                startingHour: '00:00',
                duration: '00:00',
                gameMode: 'classic',
                player1: {
                    name: 'yomama',
                    isWinner: true,
                    isQuitter: false,
                },
                player2: {
                    name: 'bloop',
                    isWinner: false,
                    isQuitter: true,
                },
            },
            {
                date: '2023-09-01',
                startingHour: '00:00',
                duration: '00:00',
                gameMode: 'classic',
                player1: {
                    name: 'yomama',
                    isWinner: true,
                    isQuitter: false,
                },
                player2: {
                    name: 'bloop',
                    isWinner: false,
                    isQuitter: true,
                },
            },
            {
                date: '2023-09-01',
                startingHour: '00:00',
                duration: '00:00',
                gameMode: 'classic',
                player1: {
                    name: 'yomama',
                    isWinner: true,
                    isQuitter: false,
                },
                player2: {
                    name: 'bloop',
                    isWinner: false,
                    isQuitter: true,
                },
            },
            {
                date: '2023-09-01',
                startingHour: '00:00',
                duration: '00:00',
                gameMode: 'classic',
                player1: {
                    name: 'yomama',
                    isWinner: true,
                    isQuitter: false,
                },
                player2: {
                    name: 'bloop',
                    isWinner: false,
                    isQuitter: true,
                },
            },
            {
                date: '2023-09-01',
                startingHour: '00:00',
                duration: '00:00',
                gameMode: 'classic',
                player1: {
                    name: 'yomama',
                    isWinner: true,
                    isQuitter: false,
                },
                player2: {
                    name: 'bloop',
                    isWinner: false,
                    isQuitter: true,
                },
            },
            {
                date: '2023-09-01',
                startingHour: '00:00',
                duration: '00:00',
                gameMode: 'classic',
                player1: {
                    name: 'yomama',
                    isWinner: true,
                    isQuitter: false,
                },
                player2: {
                    name: 'bloop',
                    isWinner: false,
                    isQuitter: true,
                },
            },
            {
                date: '2023-09-01',
                startingHour: '00:00',
                duration: '00:00',
                gameMode: 'classic',
                player1: {
                    name: 'yomama',
                    isWinner: true,
                    isQuitter: false,
                },
                player2: {
                    name: 'bloop',
                    isWinner: false,
                    isQuitter: true,
                },
            },
            {
                date: '2023-09-01',
                startingHour: '00:00',
                duration: '00:00',
                gameMode: 'classic',
                player1: {
                    name: 'yomama',
                    isWinner: true,
                    isQuitter: false,
                },
                player2: {
                    name: 'bloop',
                    isWinner: false,
                    isQuitter: true,
                },
            },
            {
                date: '2023-09-01',
                startingHour: '00:00',
                duration: '00:00',
                gameMode: 'classic',
                player1: {
                    name: 'yomama',
                    isWinner: true,
                    isQuitter: false,
                },
                player2: {
                    name: 'bloop',
                    isWinner: false,
                    isQuitter: true,
                },
            },
            {
                date: '2023-09-01',
                startingHour: '00:00',
                duration: '00:00',
                gameMode: 'classic',
                player1: {
                    name: 'yomama',
                    isWinner: true,
                    isQuitter: false,
                },
                player2: {
                    name: 'bloop',
                    isWinner: false,
                    isQuitter: true,
                },
            },
            {
                date: '2023-09-01',
                startingHour: '00:00',
                duration: '00:00',
                gameMode: 'classic',
                player1: {
                    name: 'yomama',
                    isWinner: true,
                    isQuitter: false,
                },
                player2: {
                    name: 'bloop',
                    isWinner: false,
                    isQuitter: true,
                },
            },
            {
                date: '2023-09-01',
                startingHour: '00:00',
                duration: '00:00',
                gameMode: 'classic',
                player1: {
                    name: 'yomama',
                    isWinner: true,
                    isQuitter: false,
                },
                player2: {
                    name: 'bloop',
                    isWinner: false,
                    isQuitter: true,
                },
            },
            {
                date: '2023-09-01',
                startingHour: '00:00',
                duration: '00:00',
                gameMode: 'classic',
                player1: {
                    name: 'yomama',
                    isWinner: true,
                    isQuitter: false,
                },
                player2: {
                    name: 'bloop',
                    isWinner: false,
                    isQuitter: true,
                },
            },
            {
                date: '2023-09-01',
                startingHour: '00:00',
                duration: '00:00',
                gameMode: 'classic',
                player1: {
                    name: 'yomama',
                    isWinner: true,
                    isQuitter: false,
                },
                player2: {
                    name: 'bloop',
                    isWinner: false,
                    isQuitter: true,
                },
            },
            {
                date: '2023-09-01',
                startingHour: '00:00',
                duration: '00:00',
                gameMode: 'classic',
                player1: {
                    name: 'yomama',
                    isWinner: true,
                    isQuitter: false,
                },
                player2: {
                    name: 'bloop',
                    isWinner: false,
                    isQuitter: true,
                },
            },
            {
                date: '2023-09-01',
                startingHour: '00:00',
                duration: '00:00',
                gameMode: 'classic',
                player1: {
                    name: 'yomama',
                    isWinner: true,
                    isQuitter: false,
                },
                player2: {
                    name: 'bloop',
                    isWinner: false,
                    isQuitter: true,
                },
            },
            {
                date: '2023-09-01',
                startingHour: '00:00',
                duration: '00:00',
                gameMode: 'classic',
                player1: {
                    name: 'yomama',
                    isWinner: true,
                    isQuitter: false,
                },
                player2: {
                    name: 'bloop',
                    isWinner: false,
                    isQuitter: true,
                },
            },
            {
                date: '2023-09-01',
                startingHour: '00:00',
                duration: '00:00',
                gameMode: 'classic',
                player1: {
                    name: 'yomama',
                    isWinner: true,
                    isQuitter: false,
                },
                player2: {
                    name: 'bloop',
                    isWinner: false,
                    isQuitter: true,
                },
            },
        ];
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

    get gameIdOfRoomToBeDeleted$() {
        return this.gameIdOfRoomToBeDeleted.asObservable();
    }

    get deletedGameId$() {
        return this.deletedGameId.asObservable();
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

    gameCardDeleted(gameId: string) {
        this.clientSocket.send(GameEvents.DeleteGameCard, gameId);
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

        this.clientSocket.on(GameEvents.UndoCreation, (gameId: string) => {
            this.gameIdOfRoomToBeDeleted.next(gameId);
        });

        this.clientSocket.on(GameEvents.PlayerAccepted, (acceptedPlayer: AcceptedPlayer) => {
            this.acceptedPlayerByRoom.next(acceptedPlayer);
        });

        this.clientSocket.on(GameEvents.GameCardDeleted, (gameId: string) => {
            this.deletedGameId.next(gameId);
        });
    }

    ngOnDestroy(): void {
        this.disconnect();
    }
}
