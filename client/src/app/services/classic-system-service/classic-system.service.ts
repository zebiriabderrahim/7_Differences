import { Injectable } from '@angular/core';
// import { Game } from '@app/interfaces/game-interfaces';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { GameCardService } from '@app/services/gamecard-service/gamecard.service';
import { Coordinate } from '@common/coordinate';
import { ClientSideGame, GameEvents } from '@common/game-interfaces';
import { Subject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class ClassicSystemService {
    currentGame: Subject<ClientSideGame>;
    constructor(private gameCardService: GameCardService, private clientSocket: ClientSocketService, private gameAreaService: GameAreaService) {
        this.currentGame = new Subject<ClientSideGame>();
    }
    createSoloGame(): void {
        this.gameCardService.getGameId().subscribe((id: number) => {
            this.clientSocket.send('createSoloGame', { playerName: '125', gameId: id });
        });
    }

    requestVerification(coords: Coordinate): void {
        this.clientSocket.send('removeDiff', coords);
    }

    replaceDifference(differences: Coordinate[]): void {
        if (differences.length === 0) {
            this.gameAreaService.showError(false);
        } else {
            this.gameAreaService.replaceDifference(differences);
        }
    }

    manageSocket(): void {
        this.clientSocket.connect();
        this.createSoloGame();
        this.clientSocket.on(GameEvents.CreateSoloGame, (clientGame: ClientSideGame) => {
            this.currentGame.next(clientGame);
            this.currentGame.asObservable();
        });
        this.clientSocket.on(GameEvents.RemoveDiff, (clientGame: ClientSideGame) => {
            this.replaceDifference(clientGame.currentDifference);
        });
        this.clientSocket.on(GameEvents.EndGame, (endGameMessage: string) => {
            console.log(endGameMessage);
        });
        // this.clientSocket.on(GameEvents.TimerStarted, (timer) => {
        //     console.log(timer);
        // });
    }
}
