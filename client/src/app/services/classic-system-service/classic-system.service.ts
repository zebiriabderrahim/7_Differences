import { Injectable } from '@angular/core';
import { Game } from '@app/interfaces/game-interfaces';
import { Vec2 } from '@app/interfaces/vec2';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
@Injectable({
    providedIn: 'root',
})
export class ClassicSystemService {
    constructor(private gameAreaService: GameAreaService, private clientSocket: ClientSocketService) {}

    requestVerification(game: Game, coords: Vec2) {
        this.clientSocket.send('verifyCoords', { game, coords });
    }
}
