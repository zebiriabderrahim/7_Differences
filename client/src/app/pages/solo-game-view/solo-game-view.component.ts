import { Component } from '@angular/core';
import { Game } from '@app/interfaces/game';

@Component({
    selector: 'app-solo-game-view',
    templateUrl: './solo-game-view.component.html',
    styleUrls: ['./solo-game-view.component.scss'],
})
export class SoloGameViewComponent {
    game: Game = { id: 1, name: 'test', difficultyLevel: 1, thumbnail: 'test', soloTopTime: [], oneVsOneTopTime: [] };
    isFinished: boolean = false;
    finish(): void {
        this.isFinished = true;
    }
}
