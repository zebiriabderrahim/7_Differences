import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { SoloGameViewDialogComponent } from '@app/components/solo-game-view-dialog/solo-game-view-dialog.component';
import { INPUT_TAG_NAME } from '@app/constants/constants';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { ImageService } from '@app/services/image-service/image.service';
import { Coordinate } from '@common/coordinate';
import { ChatMessage, ClientSideGame, MessageTag, Player } from '@common/game-interfaces';
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
    opponentDifferencesFound: number = 0;
    timer: number = 0;
    messages: ChatMessage[] = [];
    player: string = '';
    players: { player1: Player; player2: Player } = {
        player1: { name: '', diffData: { currentDifference: [], differencesFound: 0 } },
        player2: { name: '', diffData: { currentDifference: [], differencesFound: 0 } },
    };
    readonly canvasSize = { width: IMG_WIDTH, height: IMG_HEIGHT };
    private cheatDifferences: Coordinate[];
    private timerSub: Subscription;
    private gameSub: Subscription;
    private differenceSub: Subscription;
    private routeParamSub: Subscription;
    private messageSub: Subscription;
    private endGameSub: Subscription;
    private opponentDifferenceSub: Subscription;
    private cheatDifferencesSub: Subscription;

    // Services are needed for the dialog and dialog needs to talk to the parent component
    // eslint-disable-next-line max-params
    constructor(
        private gameAreaService: GameAreaService,
        private classicService: ClassicSystemService,
        private imageService: ImageService,
        private readonly matDialog: MatDialog,
        private route: ActivatedRoute,
    ) {
        this.classicService.manageSocket();
    }

    @HostListener('window:keydown', ['$event'])
    keyboardEvent(event: KeyboardEvent) {
        const eventHTMLElement = event.target as HTMLElement;
        if (event.key === 't' && eventHTMLElement.tagName !== INPUT_TAG_NAME) {
            this.gameAreaService.toggleCheatMode(this.cheatDifferences);
        }
    }

    ngAfterViewInit(): void {
        this.routeParamSub = this.route.params.subscribe((params) => {
            if (params['roomId']) {
                this.classicService.startGameByRoomId(params['roomId']);
            }
        });
        this.classicService.players$.subscribe((players) => {
            this.players = players;
            if (players && players.player1.playerId === this.classicService.getSocketId()) {
                this.player = players.player1.name;
            }
            if (players && players.player2?.playerId === this.classicService.getSocketId()) {
                this.player = players.player2.name;
            }
        });

        this.gameSub = this.classicService.currentGame$.subscribe((game) => {
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
                this.imageService.loadImage(this.gameAreaService.getOgContext(), this.game.original);
                this.imageService.loadImage(this.gameAreaService.getMdContext(), this.game.modified);
                this.gameAreaService.setAllData();
            }
        });
        this.timerSub = this.classicService.timer$.subscribe((timer) => {
            this.timer = timer;
        });
        this.differenceSub = this.classicService.differencesFound$.subscribe((differencesFound) => {
            this.differencesFound = differencesFound;
        });
        this.messageSub = this.classicService.message$.subscribe((message) => {
            this.messages.push(message);
        });
        this.endGameSub = this.classicService.endMessage$.subscribe((endMessage) => {
            if (endMessage) {
                this.showEndGameDialog(endMessage);
            }
        });
        this.opponentDifferenceSub = this.classicService.opponentDifferencesFound$.subscribe((opponentDifferencesFound) => {
            this.opponentDifferencesFound = opponentDifferencesFound;
        });
        this.cheatDifferencesSub = this.classicService.cheatDifferences$.subscribe((cheatDifferences) => {
            this.cheatDifferences = cheatDifferences;
        });
    }

    showAbandonDialog(): void {
        this.matDialog.open(SoloGameViewDialogComponent, {
            data: { action: 'abandon', message: 'Êtes-vous certain de vouloir abandonner la partie ?' },
            disableClose: true,
        });
    }

    showEndGameDialog(endingMessage: string): void {
        this.matDialog.open(SoloGameViewDialogComponent, { data: { action: 'endGame', message: endingMessage }, disableClose: true });
    }

    mouseClickOnCanvas(event: MouseEvent, isLeft: boolean) {
        if (this.gameAreaService.detectLeftClick(event)) {
            this.gameAreaService.setAllData();
            this.classicService.setIsLeftCanvas(isLeft);
            this.classicService.requestVerification(this.gameAreaService.getMousePosition());
        }
    }

    addRightSideMessage(text: string) {
        this.messages.push({ tag: MessageTag.sent, message: text });
        this.classicService.sendMessage(text);
    }

    ngOnDestroy(): void {
        this.gameAreaService.resetCheatMode();
        this.gameSub?.unsubscribe();
        this.timerSub?.unsubscribe();
        this.differenceSub?.unsubscribe();
        this.routeParamSub?.unsubscribe();
        this.messageSub.unsubscribe();
        this.endGameSub.unsubscribe();
        this.opponentDifferenceSub?.unsubscribe();
        this.cheatDifferencesSub.unsubscribe();
        this.classicService.disconnect();
    }
}
