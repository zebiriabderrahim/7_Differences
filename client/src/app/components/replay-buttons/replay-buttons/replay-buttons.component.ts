import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ONE_SECOND } from '@app/constants/constants';
import { ReplayService } from '@app/services/replay-service/replay.service';

@Component({
    selector: 'app-replay-buttons',
    templateUrl: './replay-buttons.component.html',
    styleUrls: ['./replay-buttons.component.scss'],
})
export class ReplayButtonsComponent implements OnInit, OnDestroy {
    @Input() isReplayAvailable: boolean;
    isReplayButtonDisabled = false;
    isReplayPaused = false;
    selectedSpeed: string;
    constructor(private readonly replayService: ReplayService) {}

    ngOnInit() {
        this.selectedSpeed = 'x1';
    }

    replay() {
        this.replayService.startReplay();
        this.replayService.restartTimer();
        this.isReplayPaused = false;
        this.isReplayButtonDisabled = true;
        setTimeout(() => {
            this.isReplayButtonDisabled = false;
        }, ONE_SECOND);
    }

    pause() {
        this.isReplayPaused = !this.isReplayPaused;
        this.replayService.pauseReplay();
    }

    resume() {
        this.isReplayPaused = !this.isReplayPaused;
        this.replayService.resumeReplay();
    }

    quit() {
        this.replayService.resetReplay();
    }

    isReplaying(): boolean {
        return this.replayService.isReplaying;
    }

    speedX1() {
        this.replayService.upSpeedx1();
    }

    speedX2() {
        this.replayService.upSpeedx2();
    }

    speedX4() {
        this.replayService.upSpeedx4();
    }

    ngOnDestroy() {
        this.replayService.resetReplay();
    }
}
