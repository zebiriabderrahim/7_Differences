import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

@Component({
    selector: 'app-chronometer',
    templateUrl: './chronometer.component.html',
    styleUrls: ['./chronometer.component.scss'],
})
export class ChronometerComponent implements OnInit, OnChanges {
    @Input() isRunning: boolean;
    time: string;
    private timerSubscription: Subscription;
    /* eslint @typescript-eslint/no-magic-numbers: ["error", { "ignoreReadonlyClassProperties": true }]*/
    private readonly oneSecond: number = 1000;
    private readonly toMinutes: number = 60;
    private readonly twoDigitLimit: number = 10;
    private readonly startTime: number = 0;

    ngOnInit() {
        this.startTimer();
    }

    ngOnChanges(): void {
        if (!this.isRunning) {
            this.stopTimer();
        }
    }

    startTimer() {
        this.isRunning = true;
        this.timerSubscription = timer(this.startTime, this.oneSecond)
            .pipe(
                map((val) => {
                    const minutes = Math.floor(val / this.toMinutes);
                    const seconds = val % this.toMinutes;
                    return `${minutes < this.twoDigitLimit ? '0' : ''}${minutes}:${seconds < this.twoDigitLimit ? '0' : ''}${seconds}`;
                }),
                takeWhile(() => this.isRunning),
            )
            .subscribe((val) => (this.time = val));
    }

    stopTimer() {
        this.isRunning = false;
        this.timerSubscription.unsubscribe();
    }
}
