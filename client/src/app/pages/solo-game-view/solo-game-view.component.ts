/* eslint-disable max-lines */
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Game } from '@app/interfaces/game-interfaces';
// import { Vec2 } from '@app/interfaces/vec2';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { GameCardService } from '@app/services/gamecard-service/gamecard.service';
import { TimerService } from '@app/services/timer-service/timer.service';

@Component({
    selector: 'app-solo-game-view',
    templateUrl: './solo-game-view.component.html',
    styleUrls: ['./solo-game-view.component.scss'],
})
export class SoloGameViewComponent implements AfterViewInit, OnDestroy {
    @ViewChild('originalCanvas', { static: false }) originalCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('modifiedCanvas', { static: false }) modifiedCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('originalCanvasFG', { static: false }) originalCanvasForeground!: ElementRef<HTMLCanvasElement>;
    @ViewChild('modifiedCanvasFG', { static: false }) modifiedCanvasForeground!: ElementRef<HTMLCanvasElement>;
    time: string = '00:00';
    game: Game;
    mode: string = 'Solo';
    penaltyTime: number = 1;
    bonusTime: number = 1;
    isLeftCanvas: boolean;
    readonly homeRoute: string = '/home';
    // private canvasSize = { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };

    // a enlever plus tard
    // eslint-disable-next-line max-params
    constructor(
        public timer: TimerService,
        private gameAreaService: GameAreaService,
        private gameCardService: GameCardService,
        private communication: CommunicationService,
        private classicService: ClassicSystemService,
    ) {}

    ngAfterViewInit(): void {
        this.timer.startTimer();
        this.time = this.timer.time;
        this.classicService.manageSocket();

        this.gameCardService.getGameId().subscribe((id) => {
            this.communication.loadGameById(id).subscribe((game) => {
                if (game) {
                    this.game = game;
                    this.gameAreaService.originalContext = this.originalCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
                    this.gameAreaService.modifiedContext = this.modifiedCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
                    this.gameAreaService.originalContextFrontLayer = this.originalCanvasForeground.nativeElement.getContext(
                        '2d',
                    ) as CanvasRenderingContext2D;
                    this.gameAreaService.modifiedContextFrontLayer = this.modifiedCanvasForeground.nativeElement.getContext(
                        '2d',
                    ) as CanvasRenderingContext2D;
                    this.gameAreaService.loadImage(this.gameAreaService.originalContext, this.game.original);
                    this.gameAreaService.loadImage(this.gameAreaService.modifiedContext, this.game.modified);
                    this.gameAreaService.setAllData();
                }
            });
        });
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

    mouseClickOnOriginal(event: MouseEvent) {
        if (this.gameAreaService.detectLeftClick(event)) {
            this.isLeftCanvas = true;
            this.gameAreaService.setAllData();
            this.classicService.requestVerification(this.gameAreaService.mousePosition);
        }
    }

    mouseClickOnModified(event: MouseEvent) {
        if (this.gameAreaService.detectLeftClick(event)) {
            this.isLeftCanvas = false;
        }
    }
    ngOnDestroy(): void {
        this.timer.stopTimer();
    }
}
