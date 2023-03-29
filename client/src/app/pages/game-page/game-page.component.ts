import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GamePageDialogComponent } from '@app/components/game-page-dialog/game-page-dialog.component';
import { DEFAULT_PLAYERS, INPUT_TAG_NAME } from '@app/constants/constants';
import { CANVAS_MEASUREMENTS } from '@app/constants/image';
import { CanvasMeasurements } from '@app/interfaces/game-interfaces';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { HintService } from '@app/services/hint-service/hint.service';
import { ImageService } from '@app/services/image-service/image.service';
import { Coordinate } from '@common/coordinate';
import { ChatMessage, ClientSideGame, MessageTag, Players } from '@common/game-interfaces';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements AfterViewInit, OnDestroy {
    @ViewChild('originalCanvas', { static: false }) originalCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('modifiedCanvas', { static: false }) modifiedCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('originalCanvasFG', { static: false }) originalCanvasForeground!: ElementRef<HTMLCanvasElement>;
    @ViewChild('modifiedCanvasFG', { static: false }) modifiedCanvasForeground!: ElementRef<HTMLCanvasElement>;
    game: ClientSideGame;
    differencesFound: number;
    opponentDifferencesFound: number;
    timer: number;
    messages: ChatMessage[];
    player: string;
    players: Players;
    readonly canvasSize: CanvasMeasurements;
    // private cheatDifferences: Coordinate[];
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
        private readonly gameAreaService: GameAreaService,
        private readonly classicService: ClassicSystemService,
        private readonly imageService: ImageService,
        private readonly hintService: HintService,
        private readonly matDialog: MatDialog,
    ) {
        this.classicService.manageSocket();
        this.differencesFound = 0;
        this.opponentDifferencesFound = 0;
        this.timer = 0;
        this.messages = [];
        this.player = '';
        this.players = DEFAULT_PLAYERS;
        this.canvasSize = CANVAS_MEASUREMENTS;
    }

    get differences(): Coordinate[][] {
        return this.classicService.differences;
    }

    @HostListener('window:keydown', ['$event'])
    keyboardEvent(event: KeyboardEvent) {
        const eventHTMLElement = event.target as HTMLElement;
        if (eventHTMLElement.tagName !== INPUT_TAG_NAME) {
            if (event.key === 't') {
                const differencesCoordinates = ([] as Coordinate[]).concat(...this.differences);
                this.gameAreaService.toggleCheatMode(differencesCoordinates);
            } else if (event.key === 'i') {
                this.hintService.requestHint();
            }
        }
    }

    ngAfterViewInit(): void {
        this.classicService.startGame();
        this.classicService.players$.subscribe((players) => {
            this.players = players;
            if (players.player1.playerId === this.classicService.getSocketId()) {
                this.player = players.player1.name;
            } else if (players.player2 && players.player2.playerId === this.classicService.getSocketId()) {
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
        // this.cheatDifferencesSub = this.classicService.cheatDifferences$.subscribe((cheatDifferences) => {
        //     this.cheatDifferences = cheatDifferences;
        // });
    }

    showAbandonDialog(): void {
        this.matDialog.open(GamePageDialogComponent, {
            data: { action: 'abandon', message: 'Êtes-vous certain de vouloir abandonner la partie ?' },
            disableClose: true,
        });
    }

    showEndGameDialog(endingMessage: string): void {
        this.matDialog.open(GamePageDialogComponent, { data: { action: 'endGame', message: endingMessage }, disableClose: true });
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
        this.messageSub?.unsubscribe();
        this.endGameSub?.unsubscribe();
        this.opponentDifferenceSub?.unsubscribe();
        this.cheatDifferencesSub?.unsubscribe();
        this.classicService.disconnect();
    }
}
