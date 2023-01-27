import { Component } from '@angular/core';
import { Game } from '@app/interfaces/game-interfaces';

@Component({
    selector: 'app-solo-game-view',
    templateUrl: './solo-game-view.component.html',
    styleUrls: ['./solo-game-view.component.scss'],
})
export class SoloGameViewComponent {
    game: Game = {
        id: 1,
        name: 'Racoon vs Rat',
        difficultyLevel: 10,
        thumbnail: '',
        soloTopTime: [],
        oneVsOneTopTime: [],
        differencesCount: 15,
        hintList: ['Look in the far left', 'The sky is beautiful', 'The rat has it'],
    };
    isFinished: boolean = false;
    finish(): void {
        this.isFinished = true;
    }
    getHint(): void {
        const hint = this.game.hintList[Math.floor(Math.random() * this.game.hintList.length)];
        window.alert(hint); // temporary until we find the best way to display it
    }
}
