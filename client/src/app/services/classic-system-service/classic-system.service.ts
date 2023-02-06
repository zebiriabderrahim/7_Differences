import { Injectable } from '@angular/core';
// import { Game } from '@app/interfaces/game-interfaces';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { Coordinate } from '@common/coordinate';
import { ClientSideGame } from '@common/game-interfaces';
@Injectable({
    providedIn: 'root',
})
export class ClassicSystemService {
    constructor(private clientSocket: ClientSocketService, private gameAreaService: GameAreaService) {}

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
        // const mockGame: Game = {
        //     id: 0,
        //     name: 'string,',
        //     difficultyLevel: true,
        //     original: 'og',
        //     modified: 'mod',
        //     soloTopTime: [],
        //     oneVsOneTopTime: [],
        //     differencesCount: 7,
        //     thumbnail: 'rbuh',
        //     hintList: [],
        // };
        // const coord: Coordinate = { x: 5, y: 6 };
        // const obj = { game: mockGame, coords: { x: 0, y: 0 } };
        // this.clientSocket.send('validateCoords', coord);
        this.clientSocket.on('validateCoords', (differences: Coordinate[]) => {
            // console.log('message received');
            // console.log(differences.length);
            this.replaceDifference(differences);
        });

        this.clientSocket.on('removeDiff', (clientGame: ClientSideGame) => {
            // console.log('message received');
            // console.log(differences.length);
            this.replaceDifference(clientGame.currentDifference);
        });

        // TODO catcher la creation d'une game
        // this.clientSocket.on('validateCoords', (coordinate: Coordinate) => {
        //     console.log('message received');
        //     console.log(coordinate);
        // });
    }
}
