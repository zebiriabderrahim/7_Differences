import { Injectable } from '@angular/core';
import { ReplayActions } from '@app/enum/replay-actions';
import { ReplayEvent } from '@app/interfaces/replay-actions';
import { CaptureService } from '@app/services/capture-service/capture.service';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { SoundService } from '@app/services/sound-service/sound.service';
import { Coordinate } from '@common/coordinate';
import { GameEvents, MessageEvents, MessageTag } from '@common/enums';
import { ChatMessage, ClientSideGame, Differences, GameConfigConst, GameRoom, Players } from '@common/game-interfaces';
import { Subject, filter } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class GameManagerService {
    replayEventsSubject: Subject<ReplayEvent>;
    differences: Coordinate[][];
    gameConstants: GameConfigConst;
    private timer: Subject<number>;
    private differencesFound: Subject<number>;
    private opponentDifferencesFound: Subject<number>;
    private currentGame: Subject<ClientSideGame>;
    private message: Subject<ChatMessage>;
    private isLeftCanvas: boolean;
    private endMessage: Subject<string>;
    private players: Subject<Players>;
    private isFirstDifferencesFound: Subject<boolean>;
    private isGameModeChanged: Subject<boolean>;
    private isGamePageRefreshed: Subject<boolean>;

    // eslint-disable-next-line max-params
    constructor(
        private readonly clientSocket: ClientSocketService,
        private readonly gameAreaService: GameAreaService,
        private readonly soundService: SoundService,
        private readonly captureService: CaptureService,
    ) {
        this.currentGame = new Subject<ClientSideGame>();
        this.differencesFound = new Subject<number>();
        this.timer = new Subject<number>();
        this.players = new Subject<Players>();
        this.message = new Subject<ChatMessage>();
        this.endMessage = new Subject<string>();
        this.opponentDifferencesFound = new Subject<number>();
        this.replayEventsSubject = new Subject<ReplayEvent>();
        this.isFirstDifferencesFound = new Subject<boolean>();
        this.isGameModeChanged = new Subject<boolean>();
        this.isGamePageRefreshed = new Subject<boolean>();
    }

    get currentGame$() {
        return this.currentGame.asObservable().pipe(filter((game) => !!game));
    }

    get timer$() {
        return this.timer.asObservable().pipe(filter((timer) => !!timer));
    }
    get differencesFound$() {
        return this.differencesFound.asObservable().pipe(filter((differencesFound) => !!differencesFound));
    }
    get message$() {
        return this.message.asObservable().pipe(filter((message) => !!message));
    }

    get endMessage$() {
        return this.endMessage.asObservable().pipe(filter((message) => !!message));
    }

    get opponentDifferencesFound$() {
        return this.opponentDifferencesFound.asObservable().pipe(filter((differencesFound) => !!differencesFound));
    }

    get players$() {
        return this.players.asObservable().pipe(filter((players) => !!players));
    }

    get isFirstDifferencesFound$() {
        return this.isFirstDifferencesFound.asObservable();
    }

    get isGameModeChanged$() {
        return this.isGameModeChanged.asObservable();
    }

    get isGamePageRefreshed$() {
        return this.isGamePageRefreshed.asObservable();
    }

    setMessage(message: ChatMessage) {
        this.message.next(message);
    }

    getSocketId(): string {
        return this.clientSocket.socket.id;
    }

    startGame(): void {
        this.clientSocket.send(GameEvents.StartGameByRoomId);
    }

    startNextGame(): void {
        this.clientSocket.send(GameEvents.StartNextGame);
    }

    checkStatus(): void {
        this.clientSocket.send(GameEvents.CheckStatus);
    }

    requestVerification(coords: Coordinate): void {
        this.clientSocket.send(GameEvents.RemoveDifference, coords);
    }

    replaceDifference(differences: Coordinate[], isPlayerIdMatch: boolean): void {
        const hasDifferences = differences.length > 0;
        if (!hasDifferences) {
            this.soundService.playErrorSound();
            this.gameAreaService.showError(this.isLeftCanvas, this.gameAreaService.mousePosition);
            return;
        }
        this.soundService.playCorrectSound();
        this.gameAreaService.setAllData();
        this.gameAreaService.replaceDifference(differences);
        if (isPlayerIdMatch) this.isFirstDifferencesFound.next(true);
    }

    handleRemoveDiff(data: { differencesData: Differences; playerId: string; cheatDifferences: Coordinate[][] }): void {
        const isPlayerIdMatch = data.playerId === this.getSocketId();
        if (isPlayerIdMatch) {
            this.replaceDifference(data.differencesData.currentDifference, isPlayerIdMatch);
            this.differencesFound.next(data.differencesData.differencesFound);
            this.checkStatus();
        } else if (data.differencesData.currentDifference.length !== 0) {
            this.replaceDifference(data.differencesData.currentDifference, isPlayerIdMatch);
            this.opponentDifferencesFound.next(data.differencesData.differencesFound);
        }
        this.differences = data.cheatDifferences;
        this.captureService.saveReplayEvent(ReplayActions.DifferenceFoundUpdate, data.differencesData.differencesFound);
    }

    abandonGame(): void {
        this.clientSocket.send(GameEvents.AbandonGame);
    }

    requestHint(): void {
        this.clientSocket.send(GameEvents.RequestHint);
    }

    setIsLeftCanvas(isLeft: boolean): void {
        this.isLeftCanvas = isLeft;
    }

    disconnect(): void {
        this.clientSocket.disconnect();
    }

    sendMessage(textMessage: string): void {
        const newMessage = { tag: MessageTag.Received, message: textMessage };
        this.captureService.saveReplayEvent(ReplayActions.CaptureMessage, { tag: MessageTag.Sent, message: textMessage } as ChatMessage);
        this.clientSocket.send(MessageEvents.LocalMessage, newMessage);
    }

    removeAllListeners() {
        this.clientSocket.socket.off();
    }

    manageSocket(): void {
        this.clientSocket.on(GameEvents.GameStarted, (room: GameRoom) => {
            this.currentGame.next(room.clientGame);
            this.gameConstants = room.gameConstants;
            this.players.next({ player1: room.player1, player2: room.player2 });
            this.differences = room.originalDifferences;
            this.soundService.stopBackgroundMusic();
            this.captureService.saveReplayEvent(ReplayActions.StartGame, room);
        });

        this.clientSocket.on(
            GameEvents.RemoveDifference,
            (data: { differencesData: Differences; playerId: string; cheatDifferences: Coordinate[][] }) => {
                this.handleRemoveDiff(data);
            },
        );

        this.clientSocket.on(GameEvents.TimerUpdate, (timer: number) => {
            this.timer.next(timer);
            this.captureService.saveReplayEvent(ReplayActions.TimerUpdate, timer);
        });

        this.clientSocket.on(GameEvents.EndGame, (endGameMessage: string) => {
            this.endMessage.next(endGameMessage);
        });

        this.clientSocket.on(MessageEvents.LocalMessage, (receivedMessage: ChatMessage) => {
            this.message.next(receivedMessage);
            this.captureService.saveReplayEvent(ReplayActions.CaptureMessage, receivedMessage);
        });

        this.clientSocket.on(GameEvents.UpdateDifferencesFound, (differencesFound: number) => {
            this.differencesFound.next(differencesFound);
        });

        this.clientSocket.on(GameEvents.GameModeChanged, () => {
            this.isGameModeChanged.next(true);
        });

        this.clientSocket.on(GameEvents.GamePageRefreshed, () => {
            this.isGamePageRefreshed.next(true);
        });
    }
}
