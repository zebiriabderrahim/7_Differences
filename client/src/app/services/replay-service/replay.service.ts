/* eslint-disable no-console */
import { Injectable } from '@angular/core';
import { REPLAY_LIMITER } from '@app/constants/replay';
import { ReplayActions } from '@app/enum/replay-actions';
import { ClickErrorData, ReplayEvent } from '@app/interfaces/replay-actions';
import { ReplayInterval } from '@app/interfaces/replay-interval';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { ChatMessage, Coordinate } from '@common/game-interfaces';

@Injectable({
    providedIn: 'root',
})
export class ReplayService {
    private replayInterval: ReplayInterval;
    private replayEvents: ReplayEvent[] = [];
    private currentReplayIndex: number = 0;
    private isReplaying: boolean = false;
    constructor(private readonly gameAreaService: GameAreaService, private readonly classicSystemService: ClassicSystemService) {
        this.gameAreaService.replayEventsSubject.asObservable().subscribe((replayEvent: ReplayEvent) => {
            if (!this.isReplaying) {
                this.replayEvents.push(replayEvent);
            }
        });
        this.classicSystemService.replayEventsSubject.asObservable().subscribe((replayEvent: ReplayEvent) => {
            if (!this.isReplaying) {
                this.replayEvents.push(replayEvent);
            }
        });
    }

    createReplayInterval(callback: () => void, getNextInterval: () => number): ReplayInterval {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        let remainingTime: number;
        let startTime: number;

        const start = (delay?: number) => {
            if (this.currentReplayIndex < this.replayEvents.length) {
                startTime = Date.now();
                remainingTime = delay === undefined ? getNextInterval() : delay;

                if (!delay) {
                    callback();
                }

                timeoutId = setTimeout(() => {
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
                start(remainingTime);
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
            case ReplayActions.StartGame:
                console.log('StartGame');
                break;
            case ReplayActions.ClickFound:
                this.gameAreaService.flashCorrectPixels(replayData.data as Coordinate[]);
                break;
            case ReplayActions.ClickError:
                this.gameAreaService.showError((replayData.data as ClickErrorData).isMainCanvas as boolean);
                console.log('ClickError');
                break;
            case ReplayActions.CaptureMessage:
                this.classicSystemService.setMessage(replayData.data as ChatMessage);
                break;
            case ReplayActions.ActivateCheat:
                this.gameAreaService.toggleCheatMode(replayData.data as Coordinate[]);
                break;
            case ReplayActions.DeactivateCheat:
                this.gameAreaService.toggleCheatMode(replayData.data as Coordinate[]);
                break;
            case ReplayActions.UseHint:
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
            return this.replayEvents[nextActionIndex].timestamp - this.replayEvents[this.currentReplayIndex].timestamp;
        }
        return REPLAY_LIMITER;
    }

    startReplay() {
        this.isReplaying = true;
        this.replayInterval = this.createReplayInterval(
            () => this.replaySwitcher(this.replayEvents[this.currentReplayIndex]),
            () => this.getNextInterval(),
        );
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

    resetReplay() {
        this.replayEvents = [];
        this.currentReplayIndex = 0;
        this.isReplaying = false;
    }
}
