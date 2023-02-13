/* eslint-disable max-lines */
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
// import { Vec2 } from '@app/interfaces/vec2';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@common/constants';
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
    game: ClientSideGame;
    differencesFound: number = 0;
    timer: number = 0;
    readonly canvasSize = { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };
    private timerSub: Subscription;
    private gameSub: Subscription;
    private differenceSub: Subscription;
    private isFirstTime = true;
    constructor(private gameAreaService: GameAreaService, private classicService: ClassicSystemService) {}

    ngAfterViewInit(): void {
        this.classicService.manageSocket();
        this.gameSub = this.classicService.getCurrentGame().subscribe((game) => {
            this.game = game;
            if (this.game && this.isFirstTime) {
                this.gameAreaService.setOgContext(
                    this.originalCanvas.nativeElement.getContext('2d', {
                        willReadFrequently: true,
                    }) as CanvasRenderingContext2D,
                );
                this.gameAreaService.setMdContext(
                    this.modifiedCanvas.nativeElement.getContext('2d', {
                        willReadFrequently: true,
                    }) as CanvasRenderingContext2D,
                );
                this.gameAreaService.setOgFrontContext(
                    this.originalCanvasForeground.nativeElement.getContext('2d', {
                        willReadFrequently: true,
                    }) as CanvasRenderingContext2D,
                );
                this.gameAreaService.setMdFrontContext(
                    this.modifiedCanvasForeground.nativeElement.getContext('2d', {
                        willReadFrequently: true,
                    }) as CanvasRenderingContext2D,
                );
                this.gameAreaService.loadImage(this.gameAreaService.getOgContext(), this.game.original);
                this.gameAreaService.loadImage(this.gameAreaService.getMdContext(), this.game.modified);
                this.gameAreaService.setAllData();
                this.isFirstTime = false;
            }
        });
        this.timerSub = this.timerSub = this.classicService.getTimer().subscribe((timer) => {
            this.timer = timer;
        });
        this.differenceSub = this.classicService.getDifferencesFound().subscribe((differencesFound) => {
            this.differencesFound = differencesFound;
        });
    }

    abandonGame(): void {
        this.classicService.showAbandonGameDialog();
    }

    mouseClickOnOriginal(event: MouseEvent) {
        if (this.gameAreaService.detectLeftClick(event)) {
            this.gameAreaService.setAllData();
            this.classicService.setIsLeftCanvas(true);
            this.classicService.requestVerification(this.gameAreaService.getMousePosition());
        }
    }

    mouseClickOnModified(event: MouseEvent) {
        if (this.gameAreaService.detectLeftClick(event)) {
            this.gameAreaService.setAllData();
            this.classicService.setIsLeftCanvas(false);
            this.classicService.requestVerification(this.gameAreaService.getMousePosition());
        }
    }
    ngOnDestroy(): void {
        this.gameSub.unsubscribe();
        this.timerSub.unsubscribe();
        this.differenceSub.unsubscribe();
    }
}
