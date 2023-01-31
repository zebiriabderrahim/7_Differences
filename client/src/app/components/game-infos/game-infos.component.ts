import { Component, Input } from '@angular/core';
import { Game } from '@app/interfaces/game-interfaces';

@Component({
    selector: 'app-game-infos',
    templateUrl: './game-infos.component.html',
    styleUrls: ['./game-infos.component.scss'],
})
export class GameInfosComponent {
    @Input() game: Game;
    @Input() mode: string;
    @Input() penaltyTime: number;
    @Input() bonusTime: number;
}
