import { Component, Input } from '@angular/core';
import { ASSETS_HINTS } from '@app/constants/hint';
import { HintProximity } from '@app/enum/hint-proximity';
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
    hintsAssets: string[];
    constructor(private readonly hintService: HintService) {
        this.hintsAssets = ASSETS_HINTS;
    }

    get nHints(): number {
        return this.hintService.nAvailableHints;
    }

    get proximity(): HintProximity {
        return this.hintService.proximity;
    }

    requestHint() {
        this.hintService.requestHint();
    }
}
