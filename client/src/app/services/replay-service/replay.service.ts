import { Injectable } from '@angular/core';
import { ReplayAction } from '@app/enum/replay-actions';
import { ReplayData } from '@app/interfaces/replay-actions';
import { ReplayInterval } from '@app/interfaces/replay-interval';

@Injectable({
    providedIn: 'root',
})
export class ReplayService {
    private replayInterval: ReplayInterval;
    private replayActions: ReplayData[] = [];
    private currentReplayIndex: number = 0;
    constructor(/* private readonly gameAreaService: GameAreaService*/) {
        this.replayInterval = this.createReplayInterval(
            () => this.replaySwitcher(this.replayActions[this.currentReplayIndex]),
            () => this.getNextInterval(),
        );
    }

    addReplayData(action: ReplayAction, timestamp: number) {
        this.replayActions.push({ action, timestamp } as ReplayData);
    }

    createReplayInterval(callback: () => void, getNextInterval: () => number): ReplayInterval {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        let remainingTime: number;
        let startTime: number;

        const start = () => {
            startTime = Date.now();
            remainingTime = getNextInterval();
            timeoutId = setTimeout(() => {
                callback();
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
            }
        };

        return { start, pause, resume, cancel };
    }

    replaySwitcher(replayData: ReplayData) {
        switch (replayData.action) {
            case ReplayAction.ClicDiffFound:
                console.log('ClicDiffFound');
                break;
            case ReplayAction.ClicError:
                // this.gameAreaService.clickError(action.timestamp);
                console.log('ClicError');
                break;
            case ReplayAction.CaptureMessage:
                // this.gameAreaService.captureMessage(action.timestamp);
                console.log('CaptureMessage');
                break;
            case ReplayAction.ActivateCheat:
                // this.gameAreaService.activateCheat(action.timestamp);
                console.log('ActivateCheat');
                break;
            case ReplayAction.DeactivateCheat:
                // this.gameAreaService.deactivateCheat(action.timestamp);
                console.log('DeactivateCheat');
                break;
            case ReplayAction.UseHint:
                // this.gameAreaService.useHint(action.timestamp);
                console.log('UseHint');
                break;
            default:
                break;
        }
    }

    getNextInterval(): number {
        const nextActionIndex = this.currentReplayIndex + 1;
        if (nextActionIndex < this.replayActions.length) {
            return this.replayActions[nextActionIndex].timestamp - this.replayActions[this.currentReplayIndex].timestamp;
        }
        return 0;
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
