import { Injectable } from '@angular/core';
import { ReplayActions } from '@app/enum/replay-actions';
import { ReplayEvent } from '@app/interfaces/replay-actions';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { SoundService } from '@app/services/sound-service/sound.service';
import { Coordinate } from '@common/coordinate';
import { GameEvents, MessageEvents, MessageTag } from '@common/enums';
import { ChatMessage, ClientSideGame, Differences, Players } from '@common/game-interfaces';
import { filter, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ClassicSystemService {
    replayEventsSubject: Subject<ReplayEvent>;
    private timer: Subject<number>;
    private differencesFound: Subject<number>;
    private opponentDifferencesFound: Subject<number>;
    private currentGame: Subject<ClientSideGame>;
    private message: Subject<ChatMessage>;
    private isLeftCanvas: boolean;
    private endMessage: Subject<string>;
    private players: Subject<Players>;
    private cheatDifferences: Subject<Coordinate[]>;
    private isFirstDifferencesFound: Subject<boolean>;

    // eslint-disable-next-line max-params
    constructor(
        private readonly clientSocket: ClientSocketService,
        private readonly gameAreaService: GameAreaService,
        private readonly soundService: SoundService,
    ) {
        this.currentGame = new Subject<ClientSideGame>();
        this.differencesFound = new Subject<number>();
        this.timer = new Subject<number>();
        this.players = new Subject<Players>();
        this.message = new Subject<ChatMessage>();
        this.endMessage = new Subject<string>();
        this.opponentDifferencesFound = new Subject<number>();
        this.cheatDifferences = new Subject<Coordinate[]>();
        this.replayEventsSubject = new Subject<ReplayEvent>();
        this.isFirstDifferencesFound = new Subject<boolean>();
    }

    get currentGame$() {
        return this.currentGame.asObservable().pipe(filter((game) => !!game));
    }

    get timer$() {
        return this.timer.asObservable();
    }
    get differencesFound$() {
        return this.differencesFound.asObservable();
    }
    get message$() {
        return this.message.asObservable();
    }

    get endMessage$() {
        return this.endMessage.asObservable();
    }

    get opponentDifferencesFound$() {
        return this.opponentDifferencesFound.asObservable();
    }

    get players$() {
        return this.players.asObservable();
    }

    get cheatDifferences$() {
        return this.cheatDifferences.asObservable();
    }

    get isFirstDifferencesFound$() {
        return this.isFirstDifferencesFound.asObservable();
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
        this.clientSocket.send(GameEvents.RemoveDiff, coords);
    }

    replaceDifference(differences: Coordinate[]): void {
        if (differences.length === 0) {
            this.soundService.playErrorSound();
            this.gameAreaService.showError(this.isLeftCanvas, this.gameAreaService.mousePosition);
        } else {
            this.isFirstDifferencesFound.next(true);
            this.soundService.playCorrectSound();
            this.gameAreaService.setAllData();
            this.gameAreaService.replaceDifference(differences);
        }
    }
    abandonGame(): void {
        this.clientSocket.send(GameEvents.AbandonGame);
    }

    setIsLeftCanvas(isLeft: boolean): void {
        this.isLeftCanvas = isLeft;
    }

    disconnect(): void {
        this.clientSocket.disconnect();
    }

    sendMessage(textMessage: string): void {
        const newMessage = { tag: MessageTag.received, message: textMessage };
        this.replayEventsSubject.next({
            action: ReplayActions.CaptureMessage,
            timestamp: Date.now(),
            data: { tag: MessageTag.sent, message: textMessage } as ChatMessage,
        });
        this.clientSocket.send(MessageEvents.LocalMessage, newMessage);
    }

    removeAllListeners() {
        this.clientSocket.socket.off();
    }

    manageSocket(): void {
        this.clientSocket.on(GameEvents.GameStarted, (data: { clientGame: ClientSideGame; players: Players; cheatDifferences: Coordinate[] }) => {
            this.currentGame.next(data.clientGame);
            this.players.next(data.players);
            this.cheatDifferences.next(data.cheatDifferences);
            if (data.players) {
                this.players.next(data.players);
            }
            this.replayEventsSubject.next({
                action: ReplayActions.StartGame,
                timestamp: Date.now(),
                data: [data.clientGame.original, data.clientGame.modified],
            });
        });
        this.clientSocket.on(GameEvents.RemoveDiff, (data: { differencesData: Differences; playerId: string; cheatDifferences: Coordinate[] }) => {
            if (data.playerId === this.getSocketId()) {
                this.replayEventsSubject.next({
                    action: ReplayActions.DifferenceFoundUpdate,
                    timestamp: Date.now(),
                    data: data.differencesData.differencesFound,
                });
                this.replaceDifference(data.differencesData.currentDifference);
                this.differencesFound.next(data.differencesData.differencesFound);
                this.checkStatus();
            } else if (data.differencesData.currentDifference.length !== 0) {
                this.replayEventsSubject.next({
                    action: ReplayActions.OpponentDifferencesFoundUpdate,
                    timestamp: Date.now(),
                    data: data.differencesData.differencesFound,
                });
                this.replaceDifference(data.differencesData.currentDifference);
                this.opponentDifferencesFound.next(data.differencesData.differencesFound);
            }
            this.cheatDifferences.next(data.cheatDifferences);
        });

        this.clientSocket.on(GameEvents.TimerUpdate, (timer: number) => {
            this.timer.next(timer);
            this.replayEventsSubject.next({
                action: ReplayActions.TimerUpdate,
                timestamp: Date.now(),
            });
        });

        this.clientSocket.on(GameEvents.EndGame, (endGameMessage: string) => {
            this.endMessage.next(endGameMessage);
        });

        this.clientSocket.on(MessageEvents.LocalMessage, (receivedMessage: ChatMessage) => {
            this.message.next(receivedMessage);
            this.replayEventsSubject.next({
                action: ReplayActions.CaptureMessage,
                timestamp: Date.now(),
                data: receivedMessage,
            });
        });
    }
}
