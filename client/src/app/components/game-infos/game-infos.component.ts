import { Component, Input } from '@angular/core';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { HintService } from '@app/services/hint-service/hint.service';
import { ClientSideGame, GameConfigConst } from '@common/game-interfaces';
@Component({
    selector: 'app-game-infos',
    templateUrl: './game-infos.component.html',
    styleUrls: ['./game-infos.component.scss'],
})
export class GameInfosComponent {
    @Input() game: ClientSideGame;
    @Input() isReplayAvailable: boolean;

    constructor(private readonly hintService: HintService, private readonly classicService: ClassicSystemService) {}

    get nHints(): number {
        return this.hintService.nAvailableHints;
    }
    get gameConstants(): GameConfigConst {
        return this.classicService.gameConstants;
    }

    requestHint() {
        this.hintService.requestHint();
    }
}
