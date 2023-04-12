/* eslint-disable max-params */
import { Injectable } from '@angular/core';
import { REPLAY_LIMITER, SPEED_X1 } from '@app/constants/replay';
import { ReplayActions } from '@app/enum/replay-actions';
import { ClickErrorData, ReplayEvent } from '@app/interfaces/replay-actions';
import { ReplayInterval } from '@app/interfaces/replay-interval';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { HintService } from '@app/services/hint-service/hint.service';
import { ImageService } from '@app/services/image-service/image.service';
import { SoundService } from '@app/services/sound-service/sound.service';
import { ChatMessage, Coordinate, GameRoom } from '@common/game-interfaces';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ReplayService {
    isReplaying: boolean = false;
    private replaySpeed = SPEED_X1;
    private currentCoords: Coordinate[] = [];
    private isCheatMode: boolean = false;
    private isDifferenceFound: boolean = false;
    private replayInterval: ReplayInterval;
    private replayEvents: ReplayEvent[] = [];
    private currentReplayIndex: number = 0;
    private replayTimer: BehaviorSubject<number>;
    private replayDifferenceFound: BehaviorSubject<number>;
    private replayOpponentDifferenceFound: BehaviorSubject<number>;

    constructor(
        private readonly gameAreaService: GameAreaService,
        private readonly classicSystemService: ClassicSystemService,
        private readonly soundService: SoundService,
        private readonly imageService: ImageService,
        private readonly hintService: HintService,
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
        this.hintService.replayEventsSubject.asObservable().subscribe((replayEvent: ReplayEvent) => {
            if (!this.isReplaying) {
                this.replayEvents.push(replayEvent);
            }
        });
        this.replayTimer = new BehaviorSubject<number>(0);
        this.replayDifferenceFound = new BehaviorSubject<number>(0);
        this.replayOpponentDifferenceFound = new BehaviorSubject<number>(0);
    }

    get replayTimer$() {
        return this.replayTimer.asObservable();
    }

    get replayDifferenceFound$() {
        return this.replayDifferenceFound.asObservable();
    }

    get replayOpponentDifferenceFound$() {
        return this.replayOpponentDifferenceFound.asObservable();
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
        switch (replayData.action) {
            case ReplayActions.StartGame:
                this.hintService.resetHints();
                this.classicSystemService.differences = (replayData.data as GameRoom).originalDifferences;
                this.imageService.loadImage(this.gameAreaService.getOgContext(), (replayData.data as GameRoom).clientGame.original);
                this.imageService.loadImage(this.gameAreaService.getMdContext(), (replayData.data as GameRoom).clientGame.modified);
                this.gameAreaService.setAllData();
                break;
            case ReplayActions.ClickFound:
                this.currentCoords = replayData.data as Coordinate[];
                this.isDifferenceFound = true;
                this.soundService.playCorrectSound();
                this.gameAreaService.setAllData();
                this.gameAreaService.replaceDifference(replayData.data as Coordinate[], this.replaySpeed);
                break;
            case ReplayActions.ClickError:
                this.soundService.playErrorSound();
                this.gameAreaService.showError(
                    (replayData.data as ClickErrorData).isMainCanvas as boolean,
                    (replayData.data as ClickErrorData).pos as Coordinate,
                    this.replaySpeed,
                );
                break;
            case ReplayActions.CaptureMessage:
                this.classicSystemService.setMessage(replayData.data as ChatMessage);
                break;
            case ReplayActions.ActivateCheat:
                this.isCheatMode = true;
                this.currentCoords = replayData.data as Coordinate[];
                this.gameAreaService.toggleCheatMode(replayData.data as Coordinate[], this.replaySpeed);
                break;
            case ReplayActions.DeactivateCheat:
                this.isCheatMode = false;
                this.gameAreaService.toggleCheatMode(replayData.data as Coordinate[], this.replaySpeed);
                break;
            case ReplayActions.TimerUpdate:
                this.replayTimer.next(replayData.data as number);
                break;
            case ReplayActions.DifferenceFoundUpdate:
                this.replayDifferenceFound.next(replayData.data as number);
                break;
            case ReplayActions.OpponentDifferencesFoundUpdate:
                this.replayOpponentDifferenceFound.next(replayData.data as number);
                break;
            case ReplayActions.UseHint:
                this.hintService.requestHint(replayData.data as Coordinate[], this.replaySpeed);
                break;
            case ReplayActions.ActivateThirdHint:
                this.hintService.switchProximity(replayData.data as number);
                break;
            case ReplayActions.DeactivateThirdHint:
                this.hintService.deactivateThirdHint();
                break;
            default:
                break;
        }
        this.currentReplayIndex++;
    }

    getNextInterval(): number {
        const nextActionIndex = this.currentReplayIndex + 1;
        this.isDifferenceFound = false;
        if (nextActionIndex < this.replayEvents.length) {
            return (this.replayEvents[nextActionIndex].timestamp - this.replayEvents[this.currentReplayIndex].timestamp) / this.replaySpeed;
        }
        return REPLAY_LIMITER;
    }

    startReplay(): void {
        this.isReplaying = true;
        this.currentReplayIndex = 0;
        this.replayInterval = this.createReplayInterval(
            () => this.replaySwitcher(this.replayEvents[this.currentReplayIndex]),
            () => this.getNextInterval(),
        );
        this.replayInterval.start();
    }

    restartReplay(): void {
        this.currentReplayIndex = 0;
        this.replayInterval.resume();
    }

    pauseReplay(): void {
        if (this.isCheatMode) {
            this.gameAreaService.toggleCheatMode(this.currentCoords, this.replaySpeed);
        }
        if (this.isDifferenceFound) {
            this.gameAreaService.flashCorrectPixels(this.currentCoords, this.replaySpeed, true);
        }
        this.replayInterval.pause();
    }

    resumeReplay(): void {
        if (this.isCheatMode) {
            this.gameAreaService.toggleCheatMode(this.currentCoords, this.replaySpeed);
        }
        if (this.isDifferenceFound) {
            this.gameAreaService.flashCorrectPixels(this.currentCoords, this.replaySpeed, false);
        }
        this.replayInterval.resume();
    }

    cancelReplay(): void {
        this.replayInterval.cancel();
        this.currentReplayIndex = 0;
    }

    upSpeed(speed: number): void {
        this.replaySpeed = speed;
    }

    restartTimer(): void {
        this.replayOpponentDifferenceFound.next(0);
        this.replayDifferenceFound.next(0);
        this.replayTimer.next(0);
    }

    resetReplay(): void {
        this.replaySpeed = SPEED_X1;
        this.replayEvents = [];
        this.currentReplayIndex = 0;
        this.isReplaying = false;
    }
}
