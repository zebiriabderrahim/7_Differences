import { Injectable, OnDestroy } from '@angular/core';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { Coordinate } from '@common/coordinate';
import { ChatMessage, ClientSideGame, Differences, GameEvents, MessageEvents, MessageTag } from '@common/game-interfaces';
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
    private joinedPlayerNames: BehaviorSubject<Map<string, string[]>>;
    private message: Subject<ChatMessage>;

    constructor(private clientSocket: ClientSocketService, private gameAreaService: GameAreaService) {
        this.currentGame = new Subject<ClientSideGame>();
        this.differencesFound = new BehaviorSubject<number>(0);
        this.timer = new BehaviorSubject<number>(0);
        this.playerName = new BehaviorSubject<string>('');
        this.id = new BehaviorSubject<string>('');
        this.oneVsOneRoomsAvailability = new Map<string, boolean>();
        this.joinedPlayerNames = new BehaviorSubject<Map<string, string[]>>(new Map<string, string[]>());
        this.message = new Subject<ChatMessage>();
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

    get message$() {
        return this.message.asObservable();
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
        this.clientSocket.send(GameEvents.CheckStatus, this.playerName.getValue());
    }

    requestVerification(coords: Coordinate): void {
        this.clientSocket.send(GameEvents.RemoveDiff, { coords, playerName: this.playerName.getValue() });
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

    acceptPlayer(gameId: string, playerNames: string[]): void {
        this.clientSocket.send(GameEvents.AcceptPlayer, { gameId, playerNames });
    }

    refusePlayer(gameId: string, playerNames: string[]): void {
        const currentNames = this.joinedPlayerNames.value;
        currentNames.set(gameId, playerNames);
        this.clientSocket.send(GameEvents.RefusePlayer, { gameId, playerNames });
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

    getUpdatedJoinedPlayerNamesByGameId(gameId: string) {
        this.clientSocket.send(GameEvents.WaitingPlayerNameListByGameId, gameId);
    }

    disconnect(): void {
        this.clientSocket.send(GameEvents.Disconnect);
        this.clientSocket.disconnect();
    }

    sendMessage(textMessage: string): void {
        const newMessage = { tag: MessageTag.received, message: textMessage };
        this.clientSocket.send(MessageEvents.LocalMessage, newMessage);
    }

    joinOneVsOneGame(gameId: string, playerName: string): void {
        this.clientSocket.send(GameEvents.JoinOneVsOneGame, { gameId, playerName });
    }

    manageSocket(): void {
        this.clientSocket.connect();
        this.clientSocket.on(GameEvents.CreateSoloGame, (clientGame: ClientSideGame) => {
            this.currentGame.next(clientGame);
        });
        this.clientSocket.on(GameEvents.CreateOneVsOneGame, (clientGame: ClientSideGame) => {
            this.currentGame.next(clientGame);
        });
        this.clientSocket.on(GameEvents.JoinOneVsOneGame, (clientGame: ClientSideGame) => {
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
            this.joinedPlayerNames.next(new Map<string, string[]>([[data.gameId, data.playerNamesList]]));
        });

        this.clientSocket.on(MessageEvents.LocalMessage, (receivedMessage: ChatMessage) => {
            this.message.next(receivedMessage);
        });
    }
}
