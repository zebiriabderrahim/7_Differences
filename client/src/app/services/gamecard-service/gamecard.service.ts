import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameCardService {
    private gameId = new Subject<number>();

    redirection(gameId: number) {
        this.gameId.next(gameId);
    }
    getGameId() {
        return this.gameId.asObservable();
    }
}
