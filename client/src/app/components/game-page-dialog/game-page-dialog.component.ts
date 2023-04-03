import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { ReplayService } from '@app/services/replay-service/replay.service';
@Component({
    selector: 'app-game-page-dialog',
    templateUrl: './game-page-dialog.component.html',
    styleUrls: ['./game-page-dialog.component.scss'],
})
export class GamePageDialogComponent {
    isReplayPaused: boolean = false;
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { action: string; message: string; isReplayMode: boolean },
        private readonly classicSystem: ClassicSystemService,
        private readonly replayService: ReplayService,
    ) {}
    abandonGame(): void {
        this.classicSystem.abandonGame();
    }

    leaveGame(): void {
        this.replayService.resetReplay();
    }

    replay() {
        this.replayService.startReplay();
        this.replayService.restartTimer();
    }
}
