import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { ClientSideGame, Player } from '@common/game-interfaces';
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
    player: string;
    players: { player1: Player; player2: Player };
    readonly canvasSize = { width: IMG_WIDTH, height: IMG_HEIGHT };
    private timerSubscription: Subscription;
    private gameSubscription: Subscription;
    private differenceSubscription: Subscription;
    private routeParamSubscription: Subscription;
    constructor(private gameAreaService: GameAreaService, private classicService: ClassicSystemService, private route: ActivatedRoute) {
        this.classicService.manageSocket();
    }

    ngAfterViewInit(): void {
        this.routeParamSubscription = this.route.params.subscribe((params) => {
            if (params['roomId']) {
                this.classicService.startGameByRoomId(params['roomId']);
            }
        });
        this.classicService.players$.subscribe((players) => {
            if (players && players.player1.playerId === this.classicService.getSocketId()) {
                this.player = players.player1.name;
            }
            if (players && players.player2.playerId === this.classicService.getSocketId()) {
                this.player = players.player2.name;
            }
        });

        this.gameSubscription = this.classicService.currentGame$.subscribe((game) => {
            this.game = game;
            if (this.game) {
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
            }
        });
        this.timerSubscription = this.classicService.timer$.subscribe((timer) => {
            this.timer = timer;
        });
        this.differenceSubscription = this.classicService.differencesFound$.subscribe((differencesFound) => {
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
        this.gameSubscription?.unsubscribe();
        this.timerSubscription?.unsubscribe();
        this.differenceSubscription?.unsubscribe();
        this.routeParamSubscription?.unsubscribe();
        this.classicService.disconnect();
    }
}
