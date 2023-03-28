import { Injectable } from '@angular/core';
import { ReplayInterval } from '@app/interfaces/replay-interval';

@Injectable({
    providedIn: 'root',
})
export class ReplayService {
    private replayInterval: ReplayInterval | null = null;
    constructor() {
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
    }
}
