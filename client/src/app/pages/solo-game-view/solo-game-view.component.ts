import { AfterViewInit, Component, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Game } from '@app/interfaces/game-interfaces';
import { CommunicationService } from '@app/services/communication-service/communication-service.service';
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
    readonly homeRoute: string = '/home';
    // private canvasSize = { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };

    constructor(
        public timer: TimerService,
        private gameAreaService: GameAreaService,
        private gameCard: GameCardService,
        private communication: CommunicationService,
    ) {}

    ngAfterViewInit(): void {
        this.timer.startTimer();
        this.time = this.timer.time;

        this.gameCard.getGameId().subscribe((id) => {
            this.communication.loadGameById(id).subscribe((game) => {
                this.game = game;
            });
        });
        this.gameAreaService.originalContext = this.originalCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gameAreaService.modifiedContext = this.modifiedCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gameAreaService.originalContextFrontLayer = this.originalCanvasForeground.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gameAreaService.modifiedContextFrontLayer = this.modifiedCanvasForeground.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gameAreaService.loadImage(this.gameAreaService.originalContext, '../../../assets/img/testBMP.bmp');
        this.gameAreaService.loadImage(this.gameAreaService.modifiedContext, '../../../assets/img/modifiedTestBMP.bmp');
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
    ngOnDestroy(): void {
        this.timer.stopTimer();
    }
}
