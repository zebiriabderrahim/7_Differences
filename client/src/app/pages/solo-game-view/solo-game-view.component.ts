/* eslint-disable max-lines */
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
// import { Vec2 } from '@app/interfaces/vec2';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { ClientSideGame } from '@common/game-interfaces';
import { Subscription } from 'rxjs';

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
    game: ClientSideGame;
    gameSub: Subscription;
    mode: string = 'Solo';
    penaltyTime: number = 1;
    bonusTime: number = 1;
    isLeftCanvas: boolean;
    isFirstTime = true;
    readonly homeRoute: string = '/home';
    // private canvasSize = { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };

    // a enlever plus tard
    // eslint-disable-next-line max-params
    constructor(private gameAreaService: GameAreaService, private classicService: ClassicSystemService) {}
    ngAfterViewInit(): void {
        this.classicService.manageSocket();
        this.gameSub = this.classicService.currentGame.subscribe((game) => {
            this.game = game;
            if (this.game && this.isFirstTime) {
                this.gameAreaService.originalContext = this.originalCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
                this.gameAreaService.modifiedContext = this.modifiedCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
                this.gameAreaService.originalContextFrontLayer = this.originalCanvasForeground.nativeElement.getContext(
                    '2d',
                ) as CanvasRenderingContext2D;
                this.gameAreaService.modifiedContextFrontLayer = this.modifiedCanvasForeground.nativeElement.getContext(
                    '2d',
                ) as CanvasRenderingContext2D;
                this.gameAreaService.loadImage(this.gameAreaService.originalContext, './assets/modified.bmp');
                this.gameAreaService.loadImage(this.gameAreaService.modifiedContext, this.game.modified);
                this.gameAreaService.setAllData();
                this.isFirstTime = false;
            }
        });
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
        }
    }

    mouseClickOnModified(event: MouseEvent) {
        if (this.gameAreaService.detectLeftClick(event)) {
            this.isLeftCanvas = false;
            this.gameAreaService.setAllData();
            this.classicService.requestVerification(this.gameAreaService.mousePosition);
            console.log(this.game.differencesFound);
        }
    }
    ngOnDestroy(): void {
        this.gameSub.unsubscribe();
    }
}
