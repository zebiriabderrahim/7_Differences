/* eslint-disable @typescript-eslint/no-explicit-any -- needed to spy on private methods */
// Needed more lines for tests
/* eslint-disable max-lines */
// Needed for empty call Fakes
/* eslint-disable @typescript-eslint/no-empty-function */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DEFAULT_PLAYERS } from '@app/constants/constants';
import { HintProximity } from '@app/enum/hint-proximity';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { GameManagerService } from '@app/services/game-manager-service/game-manager.service';
import { HintService } from '@app/services/hint-service/hint.service';
import { ReplayService } from '@app/services/replay-service/replay.service';
import { GameModes, MessageTag } from '@common/enums';
import { ChatMessage, ClientSideGame, Players } from '@common/game-interfaces';
import { BehaviorSubject, Subject } from 'rxjs';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let mouse: MouseEvent;
    let gameAreaService: GameAreaService;
    let gameManagerService: GameManagerService;
    let dialog: jasmine.SpyObj<MatDialog>;
    let gameManagerServiceSpy: jasmine.SpyObj<GameManagerService>;
    let replayServiceSpy: jasmine.SpyObj<ReplayService>;
    let hintServiceSpy: jasmine.SpyObj<HintService>;
    let routeSpy: jasmine.SpyObj<ActivatedRoute>;
    const clientSideGameTest: ClientSideGame = {
        id: '1',
        name: 'test',
        mode: 'test',
        isHard: true,
        original: 'test',
        modified: 'test',
        differencesCount: 1,
    };
    const timerTest = 1;
    const differencesFoundTest = 3;
    const opponentDifferencesFoundTest = 2;
    const endGameMessageTest = 'La partie est terminée';
    const messageTest: ChatMessage = { tag: MessageTag.Common, message: 'messageTest' };
    const mockDifferenceData = { currentDifference: [], differencesFound: 0 };

    const clientSideGameSubjectTest = new Subject<ClientSideGame>();
    const timerSubjectTest = new Subject<number>();
    const differencesFoundSubjectTest = new Subject<number>();
    const playersSubjectTest = new Subject<Players>();
    const messageSubjectTest = new Subject<ChatMessage>();
    const endMessageTest = new Subject<string>();
    const opponentDifferencesFoundSubjectTest = new Subject<number>();
    const paramsSubjectTest = new Subject<{ roomId: string }>();
    const isFirstDifferencesFoundTest = new Subject<boolean>();
    const isGameModeChangedTest = new Subject<boolean>();
    const replayTimerSubjectTest = new BehaviorSubject<number>(0);
    const replayDifferenceFoundSubjectTest = new BehaviorSubject<number>(0);
    const replayOpponentDifferenceFoundSubjectTest = new BehaviorSubject<number>(0);
    const isGamePageRefreshedTest = new Subject<boolean>();

    beforeEach(async () => {
        replayServiceSpy = jasmine.createSpyObj('ReplayService', ['resetReplay'], {
            replayTimer$: replayTimerSubjectTest,
            replayDifferenceFound$: replayDifferenceFoundSubjectTest,
            replayOpponentDifferenceFound$: replayOpponentDifferenceFoundSubjectTest,
        });
        gameManagerServiceSpy = jasmine.createSpyObj(
            'GameManagerService',
            [
                'sendMessage',
                'requestVerification',
                'manageSocket',
                'disconnect',
                'setIsLeftCanvas',
                'getSocketId',
                'startGame',
                'removeAllListeners',
                'startNextGame',
            ],
            {
                currentGame$: clientSideGameSubjectTest,
                timer$: timerSubjectTest,
                differencesFound$: differencesFoundSubjectTest,
                players$: playersSubjectTest,
                message$: messageSubjectTest,
                endMessage$: endMessageTest,
                opponentDifferencesFound$: opponentDifferencesFoundSubjectTest,
                isFirstDifferencesFound$: isFirstDifferencesFoundTest,
                isGameModeChanged$: isGameModeChangedTest,
                differences: [[{ x: 0, y: 0 }]],
                isGamePageRefreshed$: isGamePageRefreshedTest,
            },
        );
        hintServiceSpy = jasmine.createSpyObj('HintService', ['requestHint', 'resetHints', 'deactivateThirdHint', 'checkThirdHintProximity'], {
            thirdHintProximity: HintProximity.OnIt,
            nAvailableHints: 0,
            isThirdHintActive: true,
        });
        routeSpy = jasmine.createSpyObj('ActivatedRoute', ['navigate'], { params: paramsSubjectTest });
        dialog = jasmine.createSpyObj('MatDialog', ['open']);
        await TestBed.configureTestingModule({
            imports: [HttpClientModule, RouterTestingModule, MatDialogModule],
            declarations: [GamePageComponent],
            providers: [
                GameAreaService,
                { provide: GameManagerService, useValue: gameManagerServiceSpy },
                { provide: MatDialog, useValue: dialog },
                { provide: HintService, useValue: hintServiceSpy },
                { provide: ActivatedRoute, useValue: routeSpy },
                { provide: ReplayService, useValue: replayServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        gameAreaService = TestBed.inject(GameAreaService);
        gameManagerService = TestBed.inject(GameManagerService);
        fixture.detectChanges();
    });

    afterEach(() => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        spyOn(component, 'ngOnDestroy').and.callFake(() => {});
        fixture.destroy();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should define the game when the view is instantiated', () => {
        expect(component.game).not.toBeDefined();
        component.ngAfterViewInit();
        clientSideGameSubjectTest.next(clientSideGameTest);
        expect(component.game).toBeDefined();
    });

    it('differences() should return the gameManager.differences', () => {
        expect(component['differences']).toEqual(gameManagerService.differences);
    });

    it('proximity() should return hintService.thirdHintProximity', () => {
        expect(component.proximity).toEqual(hintServiceSpy.thirdHintProximity);
    });

    it('should set players and playerName and player1 as player when id matches', () => {
        const mockId = '1';
        const playersTest = {
            player1: { name: 'player1', differenceData: mockDifferenceData },
            player2: { name: 'player2', differenceData: mockDifferenceData },
        };

        gameManagerServiceSpy.getSocketId.and.returnValue(mockId);
        expect(component.players).toEqual(DEFAULT_PLAYERS);
        expect(component.player).toEqual('');
        component.ngAfterViewInit();
        playersSubjectTest.next(playersTest);
        expect(component.players).toBeDefined();
    });

    it('setUpReplay should set differencesFound', () => {
        component['setUpReplay']();
        component.isReplayAvailable = true;
        replayDifferenceFoundSubjectTest.next(differencesFoundTest);
        expect(component.differencesFound).toEqual(differencesFoundTest);
    });

    it('setUpReplay should set opponentDifferencesFound', () => {
        component['setUpReplay']();
        component.isReplayAvailable = true;
        replayOpponentDifferenceFoundSubjectTest.next(differencesFoundTest);
        expect(component.opponentDifferencesFound).toEqual(differencesFoundTest);
    });

    it('setUpReplay should set timer', () => {
        component['setUpReplay']();
        component.isReplayAvailable = true;
        replayTimerSubjectTest.next(differencesFoundTest);
        expect(component.timer).toEqual(differencesFoundTest);
    });

    it('setUpReplay should set reset messages and differencesFound if timer is 0', () => {
        component['setUpReplay']();
        component.isReplayAvailable = true;
        replayTimerSubjectTest.next(0);
        expect(component.messages).toEqual([]);
        expect(component.differencesFound).toEqual(0);
    });

    it('should set players that are id matches', () => {
        const playersTest = {
            player1: { name: 'player1', differenceData: mockDifferenceData },
            player2: { name: 'player2', differenceData: mockDifferenceData },
        };
        gameManagerServiceSpy.getSocketId.and.returnValue('0');
        expect(component.players).toEqual(DEFAULT_PLAYERS);
        component.ngAfterViewInit();
        playersSubjectTest.next(playersTest);
        expect(component.players).toEqual(playersTest);
    });

    it('should set players and player of second player if id matches', () => {
        const mockId = '1';
        const playersTest: Players = {
            player1: { name: 'player1', differenceData: mockDifferenceData },
            player2: { name: 'player2', differenceData: mockDifferenceData, playerId: mockId },
        };

        gameManagerServiceSpy.getSocketId.and.returnValue(mockId);
        expect(component.players).toEqual(DEFAULT_PLAYERS);
        expect(component.player).toEqual('');
        component.ngAfterViewInit();
        playersSubjectTest.next(playersTest);
        expect(component.players).toBeDefined();
        expect(component.player).not.toEqual(playersTest.player1.name);
    });

    it('should set players and player of second player if the 2nd player is defined', () => {
        const playersTest = {
            player1: { name: 'player1', differenceData: mockDifferenceData },
        };

        expect(component.players).toEqual(DEFAULT_PLAYERS);
        expect(component.player).toEqual('');
        component.ngAfterViewInit();
        playersSubjectTest.next(playersTest);
        expect(component.players).toEqual(playersTest);
        expect(component.player).toEqual('player1');
    });

    it('should update the timer', () => {
        expect(component.timer).toEqual(0);
        component.ngAfterViewInit();
        timerSubjectTest.next(timerTest);
        expect(component.timer).toEqual(timerTest);
    });

    it('should update the messages', () => {
        expect(component.messages.length).toEqual(0);
        component.ngAfterViewInit();
        messageSubjectTest.next(messageTest);
        expect(component.messages.length).toEqual(2);
    });

    it('should update the differences found', () => {
        expect(component.differencesFound).toEqual(0);
        component.ngAfterViewInit();
        differencesFoundSubjectTest.next(differencesFoundTest);
        expect(component.differencesFound).toEqual(differencesFoundTest);
    });

    it('should update the opponent differences found', () => {
        expect(component.opponentDifferencesFound).toEqual(0);
        component.ngAfterViewInit();
        opponentDifferencesFoundSubjectTest.next(opponentDifferencesFoundTest);
        expect(component.opponentDifferencesFound).toEqual(opponentDifferencesFoundTest);
    });

    it('updateGameMode should set set gameMode to solo if changed', () => {
        component.game = clientSideGameTest;
        component['updateGameMode']();
        isGameModeChangedTest.next(true);
        expect(component.game.mode).toEqual(GameModes.LimitedSolo);
    });

    it('updateGameMode should call gameManager.startNextGame', () => {
        component.game = clientSideGameTest;
        component.game.mode = GameModes.LimitedSolo;
        component['updateGameMode']();
        isFirstDifferencesFoundTest.next(true);
        expect(gameManagerServiceSpy.startNextGame).toHaveBeenCalled();
    });

    it('handlePageRefresh should router.navigate', () => {
        const routerNavigateSpy = spyOn(component['router'], 'navigate');
        component['handlePageRefresh']();
        isGamePageRefreshedTest.next(true);
        expect(routerNavigateSpy).toHaveBeenCalled();
    });

    it('should call showEndGameDialog when receiving endMessage', () => {
        const showEndGameDialogSpy = spyOn<any>(component, 'showEndGameDialog').and.callFake(() => {});
        component.ngAfterViewInit();
        endMessageTest.next(endGameMessageTest);
        expect(showEndGameDialogSpy).toHaveBeenCalled();
    });

    it('should call showEndGameDialog should handle undefined game', () => {
        component.ngAfterViewInit();
        component.game = undefined as unknown as ClientSideGame;
        endMessageTest.next(endGameMessageTest);
        component['showEndGameDialog']('test');
        expect(dialog.open).toHaveBeenCalled();
    });

    it('should do nothing if the left click on original image is not detected', () => {
        mouse = new MouseEvent('click', { button: 1 });
        component.mouseClickOnCanvas(mouse, false);
        expect(gameManagerService['isLeftCanvas']).toBeFalsy();
    });

    it('should set isLeftCanvas to true if the left click on original image is detected', () => {
        const gameAreaSpy = spyOn(gameAreaService, 'setAllData');
        mouse = new MouseEvent('click', { button: 0 });
        component.mouseClickOnCanvas(mouse, true);
        expect(gameManagerServiceSpy.setIsLeftCanvas).toHaveBeenCalledOnceWith(true);
        expect(gameAreaSpy).toHaveBeenCalled();
    });

    it('should do nothing if the left click on modified image is not detected', () => {
        mouse = new MouseEvent('click', { button: 1 });
        component.mouseClickOnCanvas(mouse, false);
        expect(gameManagerService['isLeftCanvas']).toBeFalsy();
    });

    it('should set isLeftCanvas to false if the left click on modified image is detected', () => {
        const gameAreaSpy = spyOn(gameAreaService, 'setAllData');
        mouse = new MouseEvent('click', { button: 0 });
        component.mouseClickOnCanvas(mouse, false);
        expect(gameManagerService['isLeftCanvas']).toBeFalsy();
        expect(gameAreaSpy).toHaveBeenCalled();
        expect(gameManagerServiceSpy).toBeTruthy();
    });

    it('checkThirdHint should call hintService.checkThirdHintProximity', () => {
        component.isReplayAvailable = false;
        component.checkThirdHint(new MouseEvent('click', { button: 0 }));
        expect(hintServiceSpy.checkThirdHintProximity).toHaveBeenCalled();
    });

    it('showAbandonDialog should open abandon dialog', () => {
        component.showAbandonDialog();
        expect(dialog.open).toHaveBeenCalled();
    });

    it('showEndGameDialog should call dialog.open with the correct arguments', () => {
        const endingMessage = 'Bravo !';
        clientSideGameTest.mode = 'Classic';
        component.game = clientSideGameTest;
        component['showEndGameDialog'](endingMessage);
        expect(dialog.open).toHaveBeenCalled();
    });

    it('addRightSideMessage should add a message to the messages array and call ClassicService.sendMessage', () => {
        const text = 'Bravo !';
        const messagesLength = component.messages.length;
        component.addRightSideMessage(text);
        expect(messagesLength).toBeLessThan(component.messages.length);
        expect(gameManagerServiceSpy.sendMessage).toHaveBeenCalledWith(text);
    });

    it('should call toggleCheatMode when "t" key is pressed', () => {
        const toggleCheatModeSpy = spyOn(gameAreaService, 'toggleCheatMode').and.callFake(() => {});
        const event = new KeyboardEvent('keydown', { key: 't' });
        window.dispatchEvent(event);
        expect(toggleCheatModeSpy).toHaveBeenCalled();
    });

    it('should call hintService.request when "i" key is pressed', () => {
        component.game = clientSideGameTest;
        component.game.mode = GameModes.ClassicSolo;
        const event = new KeyboardEvent('keydown', { key: 'i' });
        window.dispatchEvent(event);
        expect(hintServiceSpy.requestHint).toHaveBeenCalled();
    });

    it('should not call toggleCheatMode when "t" key is not pressed', () => {
        const toggleCheatModeSpy = spyOn(gameAreaService, 'toggleCheatMode').and.callFake(() => {});
        const event = new KeyboardEvent('keydown', { key: 'q' });
        window.dispatchEvent(event);
        expect(toggleCheatModeSpy).not.toHaveBeenCalled();
    });

    it('should call startGameByRoomId when the view is initialized', () => {
        const mockId = '1';
        component.ngAfterViewInit();
        paramsSubjectTest.next({ roomId: mockId });
        expect(gameManagerServiceSpy.startGame).toHaveBeenCalled();
        expect(routeSpy.params).toEqual(paramsSubjectTest);
    });

    it('isLimitedMode should return true if the game mode is limited', () => {
        component.game = clientSideGameTest;
        component.game.mode = GameModes.LimitedSolo;
        expect(component['isLimitedMode']()).toBeTruthy();
        component.game.mode = GameModes.LimitedCoop;
        expect(component['isLimitedMode']()).toBeTruthy();
    });

    it('isMultiplayerMode should return true if the game mode is Classic1v1 or LimitedCoop', () => {
        component.game = clientSideGameTest;
        component.game.mode = GameModes.LimitedCoop;
        expect(component.isMultiplayerMode()).toBeTruthy();
        component.game.mode = GameModes.ClassicOneVsOne;
        expect(component.isMultiplayerMode()).toBeTruthy();
    });
});
