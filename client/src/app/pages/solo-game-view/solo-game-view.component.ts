import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { ChatMessage, ClientSideGame, MessageTag } from '@common/game-interfaces';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

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
    messages: ChatMessage[] = [];
    readonly canvasSize = { width: IMG_WIDTH, height: IMG_HEIGHT };
    private timerSub: Subscription;
    private gameSub: Subscription;
    private differenceSub: Subscription;
    private playerNameSub: Subscription;
    private idSub: Subscription;
    private messageSub: Subscription;
    private isFirstTime = true;

    constructor(
        private gameAreaService: GameAreaService,
        private classicService: ClassicSystemService,
        public router: Router,
        private readonly matDialog: MatDialog,
    ) {}

    ngAfterViewInit(): void {
        this.classicService.manageSocket();
        this.playerNameSub = this.classicService.playerName$.subscribe((name) => {
            this.idSub = this.classicService.id$.subscribe((id) => {
                switch (this.router.url) {
                    case '/game': {
                        this.classicService.createSoloGame(name, id);
                        break;
                    }
                    case '/game/host': {
                        this.classicService.createOneVsOneGame(name, id);
                        break;
                    }
                    case '/game/join': {
                        this.classicService.joinOneVsOneGame(name, id);
                        break;
                    }
                }
            });
        });
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
        this.messageSub = this.classicService.message$.subscribe((message) => {
            this.messages.push(message);
        });
    }

    abandonGame(): void {
        this.matDialog.open(SoloGameViewComponent, {
            data: { action: 'abandon', message: 'Êtes-vous certain de vouloir abandonner la partie ?' },
            disableClose: true,
        });
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

    addRightSideMessage(text: string) {
        this.messages.push({ tag: MessageTag.sent, message: text });
        this.classicService.sendMessage(text);
    }

    ngOnDestroy(): void {
        this.gameSub.unsubscribe();
        this.timerSub.unsubscribe();
        this.differenceSub.unsubscribe();
        this.playerNameSub.unsubscribe();
        this.idSub.unsubscribe();
        this.messageSub.unsubscribe();
        this.classicService.disconnect();
    }
}
