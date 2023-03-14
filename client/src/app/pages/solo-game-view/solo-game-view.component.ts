import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { SoloGameViewDialogComponent } from '@app/components/solo-game-view-dialog/solo-game-view-dialog.component';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { ChatMessage, ClientSideGame, GameModes, MessageTag } from '@common/game-interfaces';
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
    secondPlayerName: string = '';
    messages: ChatMessage[] = [];
    gameModes: typeof GameModes;
    readonly canvasSize = { width: IMG_WIDTH, height: IMG_HEIGHT };
    private ownPlayerName: string = '';
    private timerSubscription: Subscription;
    private gameSubscription: Subscription;
    private differenceSubscription: Subscription;
    private routeParamSubscription: Subscription;
    private messageSub: Subscription;
    private endGameSub: Subscription;
    private opponentDifferenceSub: Subscription;
    private secondPlayerSub: Subscription;

    constructor(
        private gameAreaService: GameAreaService,
        private classicService: ClassicSystemService,
        private readonly matDialog: MatDialog,
        private route: ActivatedRoute,
        private roomManagerService: RoomManagerService,
    ) {
        this.roomManagerService.disconnect();
    }

    ngAfterViewInit(): void {
        this.classicService.manageSocket();
        this.routeParamSubscription = this.route.params.subscribe((params) => {
            if (params['roomId']) {
                this.classicService.startGameByRoomId(params['roomId']);
                this.ownPlayerName = params['ownPlayerName'];
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
        this.differenceSubscription = this.classicService.getDifferencesFound().subscribe((differencesFound) => {
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
        this.secondPlayerSub = this.roomManagerService.acceptedPlayerByRoom$.subscribe((acceptedPlayer) => {
            this.secondPlayerName = acceptedPlayer.playerName;
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

    mouseClickOnOriginal(event: MouseEvent) {
        if (this.gameAreaService.detectLeftClick(event)) {
            this.gameAreaService.setAllData();
            this.classicService.setIsLeftCanvas(true);
            this.classicService.requestVerification(this.gameAreaService.getMousePosition(), this.ownPlayerName);
        }
    }

    mouseClickOnModified(event: MouseEvent) {
        if (this.gameAreaService.detectLeftClick(event)) {
            this.gameAreaService.setAllData();
            this.classicService.setIsLeftCanvas(false);
            this.classicService.requestVerification(this.gameAreaService.getMousePosition(), this.ownPlayerName);
        }
    }

    addRightSideMessage(text: string) {
        this.messages.push({ tag: MessageTag.sent, message: text });
        this.classicService.sendMessage(text);
    }

    ngOnDestroy(): void {
        this.gameSubscription?.unsubscribe();
        this.timerSubscription?.unsubscribe();
        this.differenceSubscription?.unsubscribe();
        this.routeParamSubscription?.unsubscribe();
        this.messageSub.unsubscribe();
        this.endGameSub.unsubscribe();
        this.opponentDifferenceSub.unsubscribe();
        this.secondPlayerSub.unsubscribe();
        this.classicService.disconnect();
    }
}
