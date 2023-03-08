import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SoloGameViewDialogComponent } from '@app/components/solo-game-view-dialog/solo-game-view-dialog.component';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { Coordinate } from '@common/coordinate';
import { ClientSideGame, Differences, GameEvents } from '@common/game-interfaces';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class ClassicSystemService implements OnDestroy {
    private timer: BehaviorSubject<number>;
    private differencesFound: BehaviorSubject<number>;
    private currentGame: Subject<ClientSideGame>;
    private isLeftCanvas: boolean;
    private playerName: BehaviorSubject<string>;
    private id: BehaviorSubject<string>;
    private idSubscription: Subscription;
    private playerNameSubscription: Subscription;
    private oneVsOneRoomsAvailability: Map<string, boolean>;
    private joinedPlayerNames: Subject<{ gameId: string; playerNamesList: string[] }>;
    private isPlayerNameTaken: Subject<{ gameId: string; isNameAvailable: boolean }>;
    private roomId: BehaviorSubject<string>;

    constructor(private clientSocket: ClientSocketService, private gameAreaService: GameAreaService, private readonly matDialog: MatDialog) {
        this.currentGame = new Subject<ClientSideGame>();
        this.differencesFound = new BehaviorSubject<number>(0);
        this.timer = new BehaviorSubject<number>(0);
        this.playerName = new BehaviorSubject<string>('');
        this.id = new BehaviorSubject<string>('');
        this.oneVsOneRoomsAvailability = new Map<string, boolean>();
        this.joinedPlayerNames = new Subject<{ gameId: string; playerNamesList: string[] }>();
        this.isPlayerNameTaken = new Subject<{ gameId: string; isNameAvailable: boolean }>();
        this.roomId = new BehaviorSubject<string>('');
    }
    get playerName$() {
        return this.playerName.asObservable();
    }
    get id$() {
        return this.id.asObservable();
    }
    get currentGame$() {
        return this.currentGame.asObservable();
    }
    get timer$() {
        return this.timer.asObservable();
    }
    get differencesFound$() {
        return this.differencesFound.asObservable();
    }

    get joinedPlayerNamesByGameId$() {
        return this.joinedPlayerNames.asObservable();
    }

    get isNameTaken$() {
        return this.isPlayerNameTaken.asObservable();
    }

    ngOnDestroy(): void {
        if (this.idSubscription && this.playerNameSubscription) {
            this.idSubscription.unsubscribe();
            this.playerNameSubscription.unsubscribe();
        }
        this.clientSocket.disconnect();
    }

    createSoloGame(playerName: string, id: string): void {
        this.clientSocket.send(GameEvents.CreateSoloGame, { player: playerName, gameId: id });
    }
    createOneVsOneGame(playerName: string, id: string): void {
        this.clientSocket.send(GameEvents.CreateOneVsOneGame, { player: playerName, gameId: id });
    }

    checkStatus(): void {
        this.clientSocket.send(GameEvents.CheckStatus);
    }

    requestVerification(coords: Coordinate): void {
        this.clientSocket.send(GameEvents.RemoveDiff, coords);
    }

    replaceDifference(differences: Coordinate[]): void {
        if (differences.length === 0) {
            this.gameAreaService.showError(this.isLeftCanvas);
        } else {
            this.gameAreaService.replaceDifference(differences);
        }
    }
    showAbandonGameDialog() {
        this.matDialog.open(SoloGameViewDialogComponent, {
            data: { action: 'abandon', message: 'Êtes-vous certain de vouloir abandonner la partie ?' },
            disableClose: true,
        });
    }
    showEndGameDialog(endingMessage: string) {
        this.matDialog.open(SoloGameViewDialogComponent, { data: { action: 'endGame', message: endingMessage }, disableClose: true });
    }

    getCurrentGame(): Subject<ClientSideGame> {
        return this.currentGame;
    }

    getTimer(): Subject<number> {
        return this.timer;
    }

    getDifferencesFound(): Subject<number> {
        return this.differencesFound;
    }
    setIsLeftCanvas(isLeft: boolean): void {
        this.isLeftCanvas = isLeft;
    }

    checkIfOneVsOneIsAvailable(gameId: string): void {
        this.clientSocket.send(GameEvents.CheckRoomOneVsOneAvailability, gameId);
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
    acceptPlayer(gameId: string, playerName: string) {
        this.clientSocket.send(GameEvents.AcceptPlayer, { gameId, playerName });
    }

    isRoomAvailable(gameId: string): boolean | undefined {
        if (this.oneVsOneRoomsAvailability.has(gameId)) {
            return this.oneVsOneRoomsAvailability.get(gameId);
        } else {
            return false;
        }
    }

    updateOneVsOneRoomAvailability(gameId: string, isAvailableToJoin: boolean) {
        this.oneVsOneRoomsAvailability.set(gameId, isAvailableToJoin);
        this.clientSocket.send(GameEvents.UpdateRoomOneVsOneAvailability, { gameId, isAvailableToJoin });
    }
    deleteCreatedOneVsOneRoom(gameId: string) {
        this.clientSocket.send(GameEvents.DeleteCreatedOneVsOneRoom, gameId);
    }

    cancelJoining(gameId: string, playerName: string): void {
        this.clientSocket.send(GameEvents.CancelJoining, { gameId, playerName });
    }

    disconnect(): void {
        this.clientSocket.send(GameEvents.Disconnect);
        this.clientSocket.disconnect();
    }

    manageSocket(): void {
        this.clientSocket.connect();
        this.clientSocket.on(GameEvents.CreateSoloGame, (clientGame: ClientSideGame) => {
            this.currentGame.next(clientGame);
        });
        this.clientSocket.on(GameEvents.RemoveDiff, (differencesData: Differences) => {
            this.replaceDifference(differencesData.currentDifference);
            this.differencesFound.next(differencesData.differencesFound);
            this.checkStatus();
        });

        this.clientSocket.on(GameEvents.TimerStarted, (timer: number) => {
            this.timer.next(timer);
        });

        this.clientSocket.on(GameEvents.EndGame, (endGameMessage: string) => {
            this.showEndGameDialog(endGameMessage);
        });

        this.clientSocket.on(GameEvents.RoomOneVsOneAvailable, (data: { gameId: string; isAvailableToJoin: boolean }) => {
            this.oneVsOneRoomsAvailability.set(data.gameId, data.isAvailableToJoin);
        });

        this.clientSocket.on(GameEvents.DeleteCreatedOneVsOneRoom, (gameId: string) => {
            this.oneVsOneRoomsAvailability.delete(gameId);
        });

        this.clientSocket.on(GameEvents.UpdateWaitingPlayerNameList, (data: { gameId: string; playerNamesList: string[] }) => {
            this.joinedPlayerNames.next(data);
        });

        this.clientSocket.on(GameEvents.PlayerNameTaken, (data: { gameId: string; isNameAvailable: boolean }) => {
            this.isPlayerNameTaken.next(data);
        });

        this.clientSocket.on(GameEvents.RoomOneVsOneCreated, (roomId: string) => {
            this.roomId.next(roomId);
        });
    }
}
