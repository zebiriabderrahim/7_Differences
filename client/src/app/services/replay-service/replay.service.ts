import { Injectable } from '@angular/core';
import { ReplayAction } from '@app/enum/replay-actions';
import { ReplayActionData } from '@app/interfaces/replay-actions';
import { ReplayInterval } from '@app/interfaces/replay-interval';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';

@Injectable({
    providedIn: 'root',
})
export class ReplayService {
    private replayInterval: ReplayInterval;
    private replayActions: ReplayActionData[] = [];
    private currentInterval: number = 0;
    private currentReplayIndex: number = 0;
    private nextInterval: number = 0;
    constructor(private readonly gameAreaService: GameAreaService) {
        this.replayInterval = this.createReplayInterval(() => this.replaySwitcher(this.replayActions[this.currentReplayIndex]), this.nextInterval);
    }

    createReplayInterval(callback: () => void, interval: number): ReplayInterval {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        let remainingTime = interval;
        let startTime: number;

        const start = () => {
            startTime = Date.now();
            timeoutId = setTimeout(() => {
                callback();
                remainingTime = interval;
                start();
            }, remainingTime);
        };

        const pause = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                remainingTime -= Date.now() - startTime;
                timeoutId = null;
            }
        };

        const resume = () => {
            if (timeoutId === null) {
                start();
            }
        };

        const cancel = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
                remainingTime = interval;
            }
        };

        return { start, pause, resume, cancel };
    }

    replaySwitcher(action: ReplayActionData) {
        switch (action.action) {
            case ReplayAction.ClicDiffFound:
                // this.gameAreaService.clickDiffFound(action.timestamp);
                break;
            case ReplayAction.ClicError:
                // this.gameAreaService.clickError(action.timestamp);
                break;
            case ReplayAction.CaptureMessage:
                // this.gameAreaService.captureMessage(action.timestamp);
                break;
            case ReplayAction.ActivateCheat:
                // this.gameAreaService.activateCheat(action.timestamp);
                break;
            case ReplayAction.DeactivateCheat:
                // this.gameAreaService.deactivateCheat(action.timestamp);
                break;
            case ReplayAction.UseHint:
                // this.gameAreaService.useHint(action.timestamp);
                break;
            default:
                break;
        }
        this.nextInterval = this.replayActions[++this.currentReplayIndex].timestamp - this.currentInterval;
    }

    startReplay() {
        console.log('startReplay');
        this.replayInterval.start();
    }

    pauseReplay() {
        console.log('pauseReplay');
        this.replayInterval.pause();
    }

    resumeReplay() {
        console.log('resumeReplay');
        this.replayInterval.resume();
    }
}
