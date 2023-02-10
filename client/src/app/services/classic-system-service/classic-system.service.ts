import { Injectable, OnDestroy } from '@angular/core';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { Coordinate } from '@common/coordinate';
import { ClientSideGame, Differences, GameEvents } from '@common/game-interfaces';
import { Subject, Subscription } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class ClassicSystemService implements OnDestroy {
    timer: Subject<number>;
    differencesFound: Subject<number>;
    currentGame: Subject<ClientSideGame>;
    isLeftCanvas: boolean;
    private playerName: Subject<string>;
    private id: Subject<string>;
    private idSubscription: Subscription;
    private playerNameSubscription: Subscription;
    constructor(private clientSocket: ClientSocketService, private gameAreaService: GameAreaService) {
        this.currentGame = new Subject<ClientSideGame>();
        this.differencesFound = new Subject<number>();
        this.timer = new Subject<number>();
        this.playerName = new Subject<string>();
        this.id = new Subject<string>();
    }
    ngOnDestroy(): void {
        this.idSubscription.unsubscribe();
        this.playerNameSubscription.unsubscribe();
    }
    createSoloGame(): void {
        this.playerNameSubscription = this.playerName.asObservable().subscribe((playerName: string) => {
            this.idSubscription = this.id.asObservable().subscribe((id: string) => {
                this.clientSocket.send('createSoloGame', { player: playerName, gameId: id });
            });
        });
    }

    checkStatus(): void {
        this.clientSocket.send(GameEvents.CheckStatus, this.clientSocket.socket.id);
    }

    requestVerification(coords: Coordinate): void {
        this.clientSocket.send('removeDiff', coords);
    }

    replaceDifference(differences: Coordinate[]): void {
        if (differences.length === 0) {
            this.gameAreaService.showError(this.isLeftCanvas);
        } else {
            this.gameAreaService.replaceDifference(differences);
        }
    }

    manageSocket(): void {
        this.clientSocket.connect();
        this.createSoloGame();

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
            this.clientSocket.disconnect();
        });
    }
}
