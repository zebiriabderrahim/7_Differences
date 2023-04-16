import { Injectable } from '@angular/core';
import { REPLAY_LIMITER, SPEED_X1 } from '@app/constants/replay';
import { ReplayActions } from '@app/enum/replay-actions';
import { ClickErrorData, ReplayEvent, ReplayPayload } from '@app/interfaces/replay-actions';
import { ReplayInterval } from '@app/interfaces/replay-interval';
import { CaptureService } from '@app/services/capture-service/capture.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { GameManagerService } from '@app/services/game-manager-service/game-manager.service';
import { HintService } from '@app/services/hint-service/hint.service';
import { ImageService } from '@app/services/image-service/image.service';
import { SoundService } from '@app/services/sound-service/sound.service';
import { ChatMessage, Coordinate, GameRoom } from '@common/game-interfaces';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ReplayService {
    isReplaying: boolean;
    private replayEvents: ReplayEvent[];
    private replaySpeed: number;
    private currentCoords: Coordinate[];
    private isCheatMode: boolean;
    private isDifferenceFound: boolean;
    private replayInterval: ReplayInterval;
    private currentReplayIndex: number;
    private replayTimer: BehaviorSubject<number>;
    private replayDifferenceFound: BehaviorSubject<number>;
    private replayOpponentDifferenceFound: BehaviorSubject<number>;

    // Replay needs to communicate with all services
    // eslint-disable-next-line max-params
    constructor(
        private readonly gameAreaService: GameAreaService,
        private readonly gameManager: GameManagerService,
        private readonly soundService: SoundService,
        private readonly imageService: ImageService,
        private readonly hintService: HintService,
        private readonly captureService: CaptureService,
    ) {
        this.setUpCapture();
        this.isReplaying = false;
        this.replayTimer = new BehaviorSubject<number>(0);
        this.replayDifferenceFound = new BehaviorSubject<number>(0);
        this.replayOpponentDifferenceFound = new BehaviorSubject<number>(0);
        this.replayEvents = [];
        this.replaySpeed = SPEED_X1;
        this.currentCoords = [];
        this.isCheatMode = false;
        this.isDifferenceFound = false;
        this.currentReplayIndex = 0;
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
        this.toggleFlashing(true);
        this.replayInterval.pause();
    }

    resumeReplay(): void {
        this.toggleFlashing(false);
        this.replayInterval.resume();
    }

    upSpeed(speed: number): void {
        this.replaySpeed = speed;
        if (this.isCheatMode) {
            this.gameAreaService.toggleCheatMode(this.currentCoords, this.replaySpeed);
            this.gameAreaService.toggleCheatMode(this.currentCoords, this.replaySpeed);
        }
        if (this.isDifferenceFound) {
            this.gameAreaService.flashPixels(this.currentCoords, this.replaySpeed, false);
            this.gameAreaService.flashPixels(this.currentCoords, this.replaySpeed, true);
        }
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

    private toggleFlashing(isPaused: boolean): void {
        if (this.isCheatMode) {
            this.gameAreaService.toggleCheatMode(this.currentCoords, this.replaySpeed);
        }
        if (this.isDifferenceFound) {
            this.gameAreaService.flashPixels(this.currentCoords, this.replaySpeed, isPaused);
        }
    }

    private setUpCapture(): void {
        this.captureService.replayEventsSubject$.subscribe((replayEvent: ReplayEvent) => {
            if (!this.isReplaying) {
                this.replayEvents.push(replayEvent);
            }
        });
    }

    private replaySwitcher(replayData: ReplayEvent): void {
        switch (replayData.action) {
            case ReplayActions.StartGame:
                this.replayGameStart(replayData.data as ReplayPayload);
                break;
            case ReplayActions.ClickFound:
                this.replayClickFound(replayData.data as ReplayPayload);
                break;
            case ReplayActions.ClickError:
                this.replayClickError(replayData.data as ReplayPayload);
                break;
            case ReplayActions.CaptureMessage:
                this.replayCaptureMessage(replayData.data as ReplayPayload);
                break;
            case ReplayActions.ActivateCheat:
                this.replayActivateCheat(replayData.data as ReplayPayload);
                break;
            case ReplayActions.DeactivateCheat:
                this.replayDeactivateCheat(replayData.data as ReplayPayload);
                break;
            case ReplayActions.TimerUpdate:
                this.replayTimerUpdate(replayData.data as ReplayPayload);
                break;
            case ReplayActions.DifferenceFoundUpdate:
                this.replayDifferenceFoundUpdate(replayData.data as ReplayPayload);
                break;
            case ReplayActions.OpponentDifferencesFoundUpdate:
                this.replayOpponentDifferencesFoundUpdate(replayData.data as ReplayPayload);
                break;
            case ReplayActions.UseHint:
                this.replayUseHint(replayData.data as ReplayPayload);
                break;
            case ReplayActions.ActivateThirdHint:
                this.replayActivateThirdHint(replayData.data as ReplayPayload);
                break;
            case ReplayActions.DeactivateThirdHint:
                this.replayDeactivateThirdHint();
                break;
            default:
                break;
        }
        this.currentReplayIndex++;
    }

    private createReplayInterval(callback: () => void, getNextInterval: () => number): ReplayInterval {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        let remainingTime: number;
        let startTime: number;

        const start = (delay?: number) => {
            if (this.currentReplayIndex < this.replayEvents.length) {
                startTime = Date.now();
                remainingTime = !delay ? getNextInterval() : delay;

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

    private cancelReplay(): void {
        this.replayInterval.cancel();
        this.currentReplayIndex = 0;
    }

    private getNextInterval(): number {
        const nextActionIndex = this.currentReplayIndex + 1;
        this.isDifferenceFound = false;
        if (nextActionIndex < this.replayEvents.length) {
            return (this.replayEvents[nextActionIndex].timestamp - this.replayEvents[this.currentReplayIndex].timestamp) / this.replaySpeed;
        }
        return REPLAY_LIMITER;
    }

    private replayGameStart(replayData: ReplayPayload): void {
        this.hintService.resetHints();
        this.gameManager.differences = (replayData as GameRoom).originalDifferences;
        this.imageService.loadImage(this.gameAreaService.getOriginalContext(), (replayData as GameRoom).clientGame.original);
        this.imageService.loadImage(this.gameAreaService.getModifiedContext(), (replayData as GameRoom).clientGame.modified);
        this.gameAreaService.setAllData();
    }

    private replayClickFound(replayData: ReplayPayload): void {
        this.currentCoords = replayData as Coordinate[];
        this.isDifferenceFound = true;
        this.soundService.playCorrectSound();
        this.gameAreaService.setAllData();
        this.gameAreaService.replaceDifference(replayData as Coordinate[], this.replaySpeed);
    }

    private replayClickError(replayData: ReplayPayload): void {
        this.soundService.playErrorSound();
        this.gameAreaService.showError(
            (replayData as ClickErrorData).isMainCanvas as boolean,
            (replayData as ClickErrorData).pos as Coordinate,
            this.replaySpeed,
        );
    }

    private replayCaptureMessage(replayData: ReplayPayload): void {
        this.gameManager.setMessage(replayData as ChatMessage);
    }

    private replayActivateCheat(replayData: ReplayPayload): void {
        this.isCheatMode = true;
        this.currentCoords = replayData as Coordinate[];
        this.gameAreaService.toggleCheatMode(replayData as Coordinate[], this.replaySpeed);
    }

    private replayDeactivateCheat(replayData: ReplayPayload): void {
        this.isCheatMode = false;
        this.gameAreaService.toggleCheatMode(replayData as Coordinate[], this.replaySpeed);
    }

    private replayTimerUpdate(replayData: ReplayPayload): void {
        this.replayTimer.next(replayData as number);
    }

    private replayDifferenceFoundUpdate(replayData: ReplayPayload): void {
        this.replayDifferenceFound.next(replayData as number);
    }

    private replayOpponentDifferencesFoundUpdate(replayData: ReplayPayload): void {
        this.replayOpponentDifferenceFound.next(replayData as number);
    }

    private replayUseHint(replayData: ReplayPayload): void {
        this.hintService.requestHint(replayData as Coordinate[], this.replaySpeed);
    }

    private replayActivateThirdHint(replayData: ReplayPayload): void {
        this.hintService.switchProximity(replayData as number);
    }

    private replayDeactivateThirdHint(): void {
        this.hintService.deactivateThirdHint();
    }
}
