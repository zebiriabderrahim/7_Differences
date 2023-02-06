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
    // requestVerification(game: Game, coords: Vec2): void {
    //     this.clientSocket.send('validateCoords', { game, coords });
    // }
    requestVerification(coords: Coordinate): void {
        // console.log('requestVerification' + coords);
        this.clientSocket.send('validateCoords', coords);
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
            console.log(clientGame.gameName);
        });

        // TODO catcher la creation d'une game
        // this.clientSocket.on('validateCoords', (coordinate: Coordinate) => {
        //     console.log('message received');
        //     console.log(coordinate);
        // });
    }
}
