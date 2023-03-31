/* eslint-disable no-console */
import { Injectable } from '@angular/core';
import { ONE_SECOND } from '@app/constants/constants';
import { REPLAY_LIMITER, SPEED_X1, SPEED_X2, SPEED_X4 } from '@app/constants/replay';
import { ReplayActions } from '@app/enum/replay-actions';
import { ClickErrorData, ReplayEvent } from '@app/interfaces/replay-actions';
import { ReplayInterval } from '@app/interfaces/replay-interval';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { SoundService } from '@app/services/sound-service/sound.service';
import { ChatMessage, Coordinate } from '@common/game-interfaces';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ReplayService {
    isReplaying: boolean = false;
    private replaySpeed = SPEED_X1;
    private replayInterval: ReplayInterval;
    private replayEvents: ReplayEvent[] = [];
    private currentReplayIndex: number = 0;
    private replayTimer: BehaviorSubject<number>;
    constructor(
        private readonly gameAreaService: GameAreaService,
        private readonly classicSystemService: ClassicSystemService,
        private readonly soundService: SoundService,
    ) {
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
        this.replayTimer = new BehaviorSubject<number>(0);
    }

    get replayTimer$() {
        return this.replayTimer.asObservable();
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
            this.isReplaying = false;
        };

        return { start, pause, resume, cancel };
    }

    replaySwitcher(replayData: ReplayEvent): void {
        // TODO: Remove console.log
        switch (replayData.action) {
            case ReplayActions.StartGame:
                console.log('StartGame');
                console.log(replayData.data as string[]);
                break;
            case ReplayActions.ClickFound:
                this.soundService.playCorrectSound();
                this.gameAreaService.setAllData();
                this.gameAreaService.flashCorrectPixels(replayData.data as Coordinate[]);
                break;
            case ReplayActions.ClickError:
                this.soundService.playErrorSound();
                this.gameAreaService.showError(
                    (replayData.data as ClickErrorData).isMainCanvas as boolean,
                    (replayData.data as ClickErrorData).pos as Coordinate,
                );
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
            return (this.replayEvents[nextActionIndex].timestamp - this.replayEvents[this.currentReplayIndex].timestamp) / this.replaySpeed;
        }
        return REPLAY_LIMITER;
    }

    startReplay(): void {
        this.isReplaying = true;
        this.replayInterval = this.createReplayInterval(
            () => this.replaySwitcher(this.replayEvents[this.currentReplayIndex]),
            () => this.getNextInterval(),
        );
        this.replayInterval.start();
    }

    pauseReplay(): void {
        console.log('pauseReplay');
        this.replayInterval.pause();
    }

    resumeReplay(): void {
        console.log('resumeReplay');
        this.replayInterval.resume();
    }

    cancelReplay(): void {
        console.log('cancelReplay');
        this.replayInterval.cancel();
        this.currentReplayIndex = 0;
    }

    upSpeedx1(): void {
        console.log('upSpeedx1');
        this.replaySpeed = SPEED_X1;
    }

    upSpeedx2(): void {
        console.log('upSpeedx2');
        this.replaySpeed = SPEED_X2;
    }

    upSpeedx4(): void {
        console.log('upSpeedx4');
        this.replaySpeed = SPEED_X4;
    }

    restartTimer(): void {
        this.replayTimer.next(0);
        const interval = setInterval(() => {
            this.replayTimer.next(this.replayTimer.value + 1);
            if (!this.isReplaying) {
                clearInterval(interval);
            }
        }, ONE_SECOND / this.replaySpeed);
    }

    resetReplay(): void {
        this.replayEvents = [];
        this.currentReplayIndex = 0;
        this.isReplaying = false;
    }
}
