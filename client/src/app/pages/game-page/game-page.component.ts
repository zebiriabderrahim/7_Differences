import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GamePageDialogComponent } from '@app/components/game-page-dialog/game-page-dialog.component';
import { DEFAULT_PLAYERS, INPUT_TAG_NAME, SOLO_GAME_ID } from '@app/constants/constants';
import { ASSETS_HINTS } from '@app/constants/hint';
import { CANVAS_MEASUREMENTS } from '@app/constants/image';
import { HintProximity } from '@app/enum/hint-proximity';
import { CanvasMeasurements } from '@app/interfaces/game-interfaces';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { HintService } from '@app/services/hint-service/hint.service';
import { ImageService } from '@app/services/image-service/image.service';
import { ReplayService } from '@app/services/replay-service/replay.service';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { Coordinate } from '@common/coordinate';
import { GameModes, MessageTag } from '@common/enums';
import { ChatMessage, ClientSideGame, GameConfigConst, Players } from '@common/game-interfaces';
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
    showThirdHintHelp: boolean;
    hintsAssets: string[];
    isReplayAvailable: boolean;
    gameMode: typeof GameModes;
    readonly canvasSize: CanvasMeasurements;
    private timerSub: Subscription;
    private replayTimerSub: Subscription;
    private replayDifferencesFoundSub: Subscription;
    private replayOpponentDifferenceFoundSub: Subscription;
    private gameSub: Subscription;
    private differenceSub: Subscription;
    private messageSub: Subscription;
    private endGameSub: Subscription;
    private opponentDifferenceSub: Subscription;
    private isFirstDifferencesFoundSub: Subscription;
    private isGameModeChangedSub: Subscription;

    // Services are needed for the dialog and dialog needs to talk to the parent component
    // eslint-disable-next-line max-params
    constructor(
        private readonly gameAreaService: GameAreaService,
        private readonly classicService: ClassicSystemService,
        private readonly imageService: ImageService,
        private readonly hintService: HintService,
        private readonly matDialog: MatDialog,
        private readonly replayService: ReplayService,
        private readonly roomManagerService: RoomManagerService,
    ) {
        this.classicService.manageSocket();
        this.roomManagerService.handleRoomEvents();
        this.differencesFound = 0;
        this.opponentDifferencesFound = 0;
        this.timer = 0;
        this.messages = [];
        this.hintsAssets = ASSETS_HINTS;
        this.player = '';
        this.players = DEFAULT_PLAYERS;
        this.canvasSize = CANVAS_MEASUREMENTS;
        this.isReplayAvailable = false;
        this.gameMode = GameModes;
    }

    get differences(): Coordinate[][] {
        return this.classicService.differences;
    }

    get gameConstants(): GameConfigConst {
        return this.classicService.gameConstants;
    }

    get proximity(): HintProximity {
        return this.hintService.proximity;
    }

    get isThirdHintActive(): boolean {
        return this.hintService.isThirdHintActive;
    }

    @HostListener('window:keydown', ['$event'])
    keyboardEvent(event: KeyboardEvent) {
        const eventHTMLElement = event.target as HTMLElement;
        if (eventHTMLElement.tagName !== INPUT_TAG_NAME) {
            if (event.key === 't') {
                const differencesCoordinates = ([] as Coordinate[]).concat(...this.differences);
                this.gameAreaService.toggleCheatMode(differencesCoordinates);
            } else if (event.key === 'i' && this.game.mode.includes(SOLO_GAME_ID)) {
                this.hintService.requestHint();
            }
        }
    }

    ngAfterViewInit(): void {
        this.classicService.startGame();
        this.hintService.resetHints();
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

        this.replayTimerSub = this.replayService.replayTimer$.subscribe((replayTimer: number) => {
            if (this.isReplayAvailable) {
                this.timer = replayTimer;
                if (replayTimer === 0) {
                    this.messages = [];
                    this.differencesFound = 0;
                }
            }
        });

        this.replayDifferencesFoundSub = this.replayService.replayDifferenceFound$.subscribe((replayDiffFound) => {
            if (this.isReplayAvailable) {
                this.differencesFound = replayDiffFound;
            }
        });

        this.replayOpponentDifferenceFoundSub = this.replayService.replayOpponentDifferenceFound$.subscribe((replayDiffFound) => {
            if (this.isReplayAvailable) {
                this.opponentDifferencesFound = replayDiffFound;
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

        this.isFirstDifferencesFoundSub = this.classicService.isFirstDifferencesFound$.subscribe((isFirstDifferencesFound) => {
            if (isFirstDifferencesFound && this.isLimitedMode()) {
                this.classicService.startNextGame();
            }
        });

        this.isGameModeChangedSub = this.classicService.isGameModeChanged$.subscribe((isGameModeChanged) => {
            if (isGameModeChanged) {
                this.game.mode = GameModes.LimitedSolo;
            }
        });
    }

    showAbandonDialog(): void {
        this.matDialog.open(GamePageDialogComponent, {
            data: { action: 'abandon', message: 'Êtes-vous certain de vouloir abandonner la partie ? ' },
            disableClose: true,
            panelClass: 'dialog',
        });
    }

    showEndGameDialog(endingMessage: string): void {
        this.matDialog.open(GamePageDialogComponent, {
            data: { action: 'endGame', message: endingMessage, isReplayMode: this.game?.mode.includes('Classic') },
            disableClose: true,
        });
        if (this.game?.mode.includes('Classic')) {
            this.isReplayAvailable = true;
        }
    }

    mouseClickOnCanvas(event: MouseEvent, isLeft: boolean) {
        if (this.gameAreaService.detectLeftClick(event)) {
            if (this.isThirdHintActive) {
                this.hintService.deactivateThirdHint();
            }
            this.gameAreaService.setAllData();
            this.classicService.setIsLeftCanvas(isLeft);
            this.classicService.requestVerification(this.gameAreaService.getMousePosition());
        }
    }

    checkThirdHint(event: MouseEvent) {
        if (this.hintService.nAvailableHints === 0 && this.isReplayAvailable === false) {
            this.hintService.checkThirdHint({ x: event.offsetX, y: event.offsetY });
        }
    }

    addRightSideMessage(text: string) {
        this.messages.push({ tag: MessageTag.sent, message: text });
        this.classicService.sendMessage(text);
    }

    isLimitedMode(): boolean {
        return this.game.mode === GameModes.LimitedCoop || this.game.mode === GameModes.LimitedSolo;
    }

    isMultiplayerMode(): boolean {
        return this.game.mode === GameModes.LimitedCoop || this.game.mode === GameModes.ClassicOneVsOne;
    }

    cleanUpLogic(): void {
        this.gameAreaService.resetCheatMode();
        this.gameSub?.unsubscribe();
        this.timerSub?.unsubscribe();
        this.differenceSub?.unsubscribe();
        this.messageSub?.unsubscribe();
        this.endGameSub?.unsubscribe();
        this.opponentDifferenceSub?.unsubscribe();
        this.replayTimerSub?.unsubscribe();
        this.replayDifferencesFoundSub?.unsubscribe();
        this.replayOpponentDifferenceFoundSub?.unsubscribe();
        this.isFirstDifferencesFoundSub?.unsubscribe();
        this.isGameModeChangedSub?.unsubscribe();
        this.classicService.removeAllListeners();
        this.roomManagerService.removeAllListeners();
    }

    ngOnDestroy(): void {
        this.cleanUpLogic();
    }
}
