import { Component, Input } from '@angular/core';
import { ClientSideGame } from '@common/game-interfaces';

@Component({
    selector: 'app-game-infos',
    templateUrl: './game-infos.component.html',
    styleUrls: ['./game-infos.component.scss'],
})
export class GameInfosComponent {
    @Input() game: ClientSideGame;
    @Input() mode: string;
    @Input() penaltyTime: number;
    @Input() bonusTime: number;
}
