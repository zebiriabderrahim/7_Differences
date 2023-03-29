import { Component } from '@angular/core';
import { ReplayService } from '@app/services/replay-service/replay.service';

@Component({
    selector: 'app-replay-buttons',
    templateUrl: './replay-buttons.component.html',
    styleUrls: ['./replay-buttons.component.scss'],
})
export class ReplayButtonsComponent {
    isReplayPaused = false;
    constructor(private readonly replayService: ReplayService) {}

    pause() {
        this.replayService.pauseReplay();
    }

    resume() {
        this.replayService.resumeReplay();
    }
}
