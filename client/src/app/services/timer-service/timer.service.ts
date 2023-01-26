import { Injectable } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';
import { MINUTE_CONVERSION, START_TIME, TWO_DIGIT_LIMIT, ONE_SECOND } from '@app/constants/constants';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    time: string;
    isRunning: boolean;
    private timerSubscription: Subscription;
    startTimer() {
        this.isRunning = true;
        this.timerSubscription = timer(START_TIME, ONE_SECOND)
            .pipe(
                map((val) => {
                    const minutes = Math.floor(val / MINUTE_CONVERSION);
                    const seconds = val % MINUTE_CONVERSION;
                    return `${minutes < TWO_DIGIT_LIMIT ? '0' : ''}${minutes}:${seconds < TWO_DIGIT_LIMIT ? '0' : ''}${seconds}`;
                }),
                takeWhile(() => this.isRunning),
            )
            .subscribe((val) => (this.time = val));
    }

    stopTimer() {
        this.isRunning = false;
        this.timerSubscription.unsubscribe();
    }

    resetTimer() {
        this.stopTimer();
        this.isRunning = false;
    }
}
