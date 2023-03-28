import { Injectable } from '@angular/core';
import { ReplayAction } from '@app/enum/replay-actions';
import { ReplayEvent } from '@app/interfaces/replay-actions';
import { ReplayInterval } from '@app/interfaces/replay-interval';

@Injectable({
    providedIn: 'root',
})
export class ReplayService {
    private replayInterval: ReplayInterval;
    private replayEvents: ReplayEvent[] = [];
    private currentReplayIndex: number = 0;
    constructor(/* private readonly gameAreaService: GameAreaService*/) {
        this.replayInterval = this.createReplayInterval(
            () => this.replaySwitcher(this.replayEvents[this.currentReplayIndex]),
            () => this.getNextInterval(),
        );
    }

    resetReplay() {
        this.replayEvents = [];
        this.currentReplayIndex = 0;
    }

    addReplayData(action: ReplayAction, timestamp: number) {
        this.replayEvents.push({ action, timestamp } as ReplayEvent);
    }

    createReplayInterval(callback: () => void, getNextInterval: () => number): ReplayInterval {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        let remainingTime: number;
        let startTime: number;

        const start = () => {
            if (this.currentReplayIndex < this.replayEvents.length) {
                startTime = Date.now();
                remainingTime = getNextInterval();
                timeoutId = setTimeout(() => {
                    callback();
                    start();
                }, remainingTime);
            } else {
                this.cancelReplay();
            }
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

    replaySwitcher(replayData: ReplayEvent) {
        // TODO: Remove console.log
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
        this.currentReplayIndex++;
    }

    getNextInterval(): number {
        const nextActionIndex = this.currentReplayIndex + 1;
        if (nextActionIndex < this.replayEvents.length) {
            // TODO: Remove console.log
            const milliseconds = this.replayEvents[nextActionIndex].timestamp - this.replayEvents[this.currentReplayIndex].timestamp;
            const seconds = Math.floor(milliseconds / 1000);
            const remainingMilliseconds = milliseconds % 1000;
            console.log(`${seconds}.${remainingMilliseconds} s`);
            // TODO: Remove console.log
            return this.replayEvents[nextActionIndex].timestamp - this.replayEvents[this.currentReplayIndex].timestamp;
        }
        return 1;
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

    cancelReplay() {
        console.log('cancelReplay');
        this.replayInterval.cancel();
        this.currentReplayIndex = 0;
    }
}
