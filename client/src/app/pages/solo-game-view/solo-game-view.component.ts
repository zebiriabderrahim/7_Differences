import { Component, OnInit } from '@angular/core';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@app/constants/constants';
import { Game } from '@app/interfaces/game-interfaces';
import { TimerService } from '@app/services/timer-service/timer.service';

@Component({
    selector: 'app-solo-game-view',
    templateUrl: './solo-game-view.component.html',
    styleUrls: ['./solo-game-view.component.scss'],
})
export class SoloGameViewComponent implements OnInit {
    time: string = '00:00';
    game: Game = {
        id: 1,
        name: 'Racoon vs Rat',
        difficultyLevel: 10,
        thumbnail: '',
        soloTopTime: [],
        oneVsOneTopTime: [],
        differencesCount: 15,
        hintList: ['Look in the far left', 'The sky is beautiful', 'The rat has it'],
    };
    mode: string = 'Solo';
    penaltyTime: number = 1;
    bonusTime: number = 1;
    readonly homeRoute: string = '/home';
    private canvasSize = { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };

    constructor(public timer: TimerService) {}
    get width(): number {
        return this.canvasSize.width;
    }

    get height(): number {
        return this.canvasSize.height;
    }

    ngOnInit() {
        this.timer.startTimer();
        this.time = this.timer.time;
    }
    finish() {
        this.timer.resetTimer();
    }
    getHint(index: number): void {
        const hint = this.game.hintList[index];
        window.alert(hint); // temporary until we find the best way to display it
    }
    abandonGame(): void {
        // this.timer.stopTimer();
    }
}
