import { Injectable } from '@angular/core';
import { GAME_ID_MAX } from '@app/constants/constants';
// import { Game } from '@app/interfaces/game-interfaces';

@Injectable({
    providedIn: 'root',
})
export class GameService {

  ids: number[] = [];
    constructor() {}

    generateId(): number {
        let id;
        do {
            id = Math.floor(Math.random() * GAME_ID_MAX);
        } while (this.ids.includes(id));

        this.ids.push(id);
        return id;
    }

    // createGame(): Game {
    //     return {
    //         id: this.generateId(),
    //         name: 'New Game',
    //         // players: [],
    //         // rounds: [],
    //     };
    // }
}
