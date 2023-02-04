import { Injectable } from '@angular/core';
import { GAME_ID_MAX } from '@app/constants/constants';
import { GameDetails } from '@app/interfaces/game-interfaces';
import { CommunicationService } from '@app/services/communication-service/communication-service.service';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    ids: number[] = [];
    constructor(public communicationService: CommunicationService) {}

    generateId(): number {
        let id;
        do {
            id = Math.floor(Math.random() * GAME_ID_MAX);
        } while (this.ids.includes(id));

        this.ids.push(id);
        return id;
    }

    postGame(gameDetails: GameDetails): void {
        const finalGameDetails: GameDetails = {
            id: this.generateId(),
            name: gameDetails.name,
            originalImage: gameDetails.originalImage,
            modifiedImage: gameDetails.modifiedImage,
            nDifference: gameDetails.nDifference,
            differences: gameDetails.differences,
            isHard: gameDetails.isHard,
        };
        this.communicationService.postGame(finalGameDetails);
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
