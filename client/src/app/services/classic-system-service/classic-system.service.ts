import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SoloGameViewDialogComponent } from '@app/components/solo-game-view-dialog/solo-game-view-dialog.component';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { Coordinate } from '@common/coordinate';
import { ClientSideGame, Differences, GameEvents, Player } from '@common/game-interfaces';
import { filter, Subject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class ClassicSystemService implements OnDestroy {
    private timer: Subject<number>;
    private differencesFound: Subject<number>;
    private currentGame: Subject<ClientSideGame>;
    private isLeftCanvas: boolean;
    private players: Subject<{ player1: Player; player2: Player }>;

    constructor(private clientSocket: ClientSocketService, private gameAreaService: GameAreaService, private readonly matDialog: MatDialog) {
        this.currentGame = new Subject<ClientSideGame>();
        this.differencesFound = new Subject<number>();
        this.timer = new Subject<number>();
        this.players = new Subject<{ player1: Player; player2: Player }>();
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

    get players$() {
        return this.players.asObservable();
    }

    getSocketId(): string {
        return this.clientSocket.socket.id;
    }

    createSoloGame(gameId: string, playerName: string): void {
        this.clientSocket.send(GameEvents.CreateSoloGame, { gameId, playerName });
    }
    startGameByRoomId(roomId: string): void {
        this.clientSocket.send(GameEvents.StartGameByRoomId, roomId);
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

    abandonGame(): void {
        this.clientSocket.send(GameEvents.AbandonGame);
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

    setIsLeftCanvas(isLeft: boolean): void {
        this.isLeftCanvas = isLeft;
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

        this.clientSocket.on(GameEvents.GameStarted, (data: { clientGame: ClientSideGame; players: { player1: Player; player2: Player } }) => {
            this.currentGame.next(data.clientGame);
            if (data.players) {
                this.players.next(data.players);
            }
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
    }

    ngOnDestroy(): void {
        this.clientSocket.disconnect();
    }
}
