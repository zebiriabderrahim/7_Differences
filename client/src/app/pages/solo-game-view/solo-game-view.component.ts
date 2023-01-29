import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Game } from '@app/interfaces/game-interfaces';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { TimerService } from '@app/services/timer-service/timer.service';

@Component({
    selector: 'app-solo-game-view',
    templateUrl: './solo-game-view.component.html',
    styleUrls: ['./solo-game-view.component.scss'],
})
export class SoloGameViewComponent implements OnInit, AfterViewInit {
    @ViewChild('originalCanvas', { static: false }) originalCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('modifiedCanvas', { static: false }) modifiedCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('originalCanvasFG', { static: false }) originalCanvasForeground!: ElementRef<HTMLCanvasElement>;
    @ViewChild('modifiedCanvasFG', { static: false }) modifiedCanvasForeground!: ElementRef<HTMLCanvasElement>;
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
    isFinished: boolean = false;
    mode: string = 'Solo';
    penaltyTime: number = 1;
    bonusTime: number = 1;
    readonly homeRoute: string = '/home';
    // private canvasSize = { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };

    constructor(public timer: TimerService, private gameAreaService: GameAreaService) {}

    ngAfterViewInit(): void {
        this.gameAreaService.originalContext = this.originalCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gameAreaService.modifiedContext = this.modifiedCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gameAreaService.originalContextFrontLayer = this.originalCanvasForeground.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gameAreaService.modifiedContextFrontLayer = this.modifiedCanvasForeground.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gameAreaService.onLoad(this.gameAreaService.originalContext, '');
        this.gameAreaService.onLoad(this.gameAreaService.modifiedContext, '');
    }

    ngOnInit() {
        this.timer.startTimer();
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
    mouseHitDetectOriginalImage(event: MouseEvent) {
        if (this.gameAreaService.detectLeftClick(event)) {
            this.displayError(true);
        }
    }

    mouseHitDetectModifiedImage(event: MouseEvent) {
        if (this.gameAreaService.detectLeftClick(event)) {
            this.displayError(false);
        }
    }
    displayError(isMain: boolean): void {
        this.gameAreaService.showError(isMain);
    }
}
