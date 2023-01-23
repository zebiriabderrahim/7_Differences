import { Component, Input } from '@angular/core';
import { Game } from '@app/interfaces/game';

@Component({
    selector: 'app-game-infos',
    templateUrl: './game-infos.component.html',
    styleUrls: ['./game-infos.component.scss'],
})
export class GameInfosComponent {
    @Input() game: Game = {
        id: 1,
        name: 'Racoon vs Rat',
        difficultyLevel: 10,
        thumbnail: '',
        soloTopTime: [],
        oneVsOneTopTime: [],
        differencesCount: 15,
        hintList: ['Look in the far left', 'The sky is beautiful', 'The rat has it'],
    };
}
