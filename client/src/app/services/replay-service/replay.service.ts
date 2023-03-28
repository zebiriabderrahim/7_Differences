import { Injectable } from '@angular/core';
import { ReplayActionData } from '@app/interfaces/replay-actions';
import { ReplayInterval } from '@app/interfaces/replay-interval';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';

@Injectable({
    providedIn: 'root',
})
export class ReplayService {
    private replayInterval: ReplayInterval;
    private replayActions: ReplayActionData[] = [];
    constructor(private readonly gameAreaService: GameAreaService) {
        this.replayInterval = this.createReplayInterval(this.startReplay, 1000);
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
