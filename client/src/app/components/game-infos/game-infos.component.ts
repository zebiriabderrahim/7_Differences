import { Component, Input } from '@angular/core';
import { HintService } from '@app/services/hint-service/hint.service';
import { ClientSideGame, GameConfigConst } from '@common/game-interfaces';
@Component({
    selector: 'app-game-infos',
    templateUrl: './game-infos.component.html',
    styleUrls: ['./game-infos.component.scss'],
})
export class GameInfosComponent {
    @Input() game: ClientSideGame;
    @Input() differencesCount: number;
    @Input() gameConstants: GameConfigConst;
    constructor(private readonly hintService: HintService) {}

    get nHints(): number {
        return this.hintService.nAvailableHints;
    }

    requestHint() {
        this.hintService.requestHint();
    }
}
