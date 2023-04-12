// Needed for empty call Fakes
/* eslint-disable @typescript-eslint/no-empty-function */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DEFAULT_PLAYERS } from '@app/constants/constants';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { ReplayService } from '@app/services/replay-service/replay.service';
import { MessageTag } from '@common/enums';
import { ChatMessage, ClientSideGame, Players } from '@common/game-interfaces';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let mouse: MouseEvent;
    let gameAreaService: GameAreaService;
    let classicService: ClassicSystemService;
    let dialog: jasmine.SpyObj<MatDialog>;
    let classicServiceSpy: jasmine.SpyObj<ClassicSystemService>;
    let replayServiceSpy: jasmine.SpyObj<ReplayService>;
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
    const messageTest: ChatMessage = { tag: MessageTag.common, message: 'messageTest' };
    // const cheatDifferenceTest: Coordinate[] = [];
    const mockDifferenceData = { currentDifference: [], differencesFound: 0 };

    const clientSideGameSubjectTest = new Subject<ClientSideGame>();
    const timerSubjectTest = new Subject<number>();
    const differencesFoundSubjectTest = new Subject<number>();
    const playersSubjectTest = new Subject<Players>();
    const messageSubjectTest = new Subject<ChatMessage>();
    const endMessageTest = new Subject<string>();
    const opponentDifferencesFoundSubjectTest = new Subject<number>();
    // const cheatDifferencesSubjectTest = new Subject<Coordinate[]>();
    const paramsSubjectTest = new Subject<{ roomId: string }>();
    const isFirstDifferencesFoundTest = new Subject<boolean>();
    const isGameModeChangedTest = new Subject<boolean>();
    const replayTimerSubjectTest = new BehaviorSubject<number>(0);
    const replayDifferenceFoundSubjectTest = new BehaviorSubject<number>(0);
    const replayOpponentDifferenceFoundSubjectTest = new BehaviorSubject<number>(0);

    beforeEach(async () => {
        replayServiceSpy = jasmine.createSpyObj('ReplayService', ['resetReplay'], {
            replayTimer$: replayTimerSubjectTest,
            replayDifferenceFound$: replayDifferenceFoundSubjectTest,
            replayOpponentDifferenceFound$: replayOpponentDifferenceFoundSubjectTest,
        });
        classicServiceSpy = jasmine.createSpyObj(
            'ClassicService',
            ['sendMessage', 'requestVerification', 'manageSocket', 'disconnect', 'setIsLeftCanvas', 'getSocketId', 'startGame', 'removeAllListeners'],
            {
                currentGame$: clientSideGameSubjectTest,
                timer$: timerSubjectTest,
                differencesFound$: differencesFoundSubjectTest,
                players$: playersSubjectTest,
                message$: messageSubjectTest,
                endMessage$: endMessageTest,
                opponentDifferencesFound$: opponentDifferencesFoundSubjectTest,
                // cheatDifferences$: cheatDifferencesSubjectTest,
                isFirstDifferencesFound$: isFirstDifferencesFoundTest,
                isGameModeChanged$: isGameModeChangedTest,
            },
        );
        routeSpy = jasmine.createSpyObj('ActivatedRoute', ['navigate'], { params: paramsSubjectTest });
        dialog = jasmine.createSpyObj('MatDialog', ['open']);
        await TestBed.configureTestingModule({
            imports: [HttpClientModule, RouterTestingModule, MatDialogModule],
            declarations: [GamePageComponent],
            providers: [
                GameAreaService,
                { provide: ClassicSystemService, useValue: classicServiceSpy },
                { provide: MatDialog, useValue: dialog },
                { provide: ActivatedRoute, useValue: routeSpy },
                { provide: ReplayService, useValue: replayServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        gameAreaService = TestBed.inject(GameAreaService);
        classicService = TestBed.inject(ClassicSystemService);
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

    it('should set players and playerName and player1 as player when id matches', () => {
        const mockId = '1';
        const playersTest = {
            player1: { playerId: mockId, name: 'player1', differenceData: mockDifferenceData },
            player2: { playerId: 'not', name: 'player2', differenceData: mockDifferenceData },
        };

        classicServiceSpy.getSocketId.and.returnValue(mockId);
        expect(component.players).toEqual(DEFAULT_PLAYERS);
        expect(component.player).toEqual('');
        component.ngAfterViewInit();
        playersSubjectTest.next(playersTest);
        expect(component.players).toBeDefined();
        expect(component.player).toEqual(playersTest.player1.name);
    });

    it('should set players that are id matches', () => {
        const playersTest = {
            player1: { playerId: '1', name: 'player1', differenceData: mockDifferenceData },
            player2: { playerId: '2', name: 'player2', differenceData: mockDifferenceData },
        };
        classicServiceSpy.getSocketId.and.returnValue('0');
        expect(component.players).toEqual(DEFAULT_PLAYERS);
        component.ngAfterViewInit();
        playersSubjectTest.next(playersTest);
        expect(component.players).toEqual(playersTest);
    });

    it('should set players and player of second player if id matches', () => {
        const mockId = '1';
        const playersTest = {
            player1: { playerId: 'not', name: 'player1', differenceData: mockDifferenceData },
            player2: { playerId: mockId, name: 'player2', differenceData: mockDifferenceData },
        };

        classicServiceSpy.getSocketId.and.returnValue(mockId);
        expect(component.players).toEqual(DEFAULT_PLAYERS);
        expect(component.player).toEqual('');
        component.ngAfterViewInit();
        playersSubjectTest.next(playersTest);
        expect(component.players).toBeDefined();
        expect(component.player).toEqual(playersTest.player2.name);
    });

    it('should set players and player of second player if the 2nd player is defined', () => {
        const playersTest = {
            player1: { playerId: 'gdfgd', name: 'player1', differenceData: mockDifferenceData },
        };

        expect(component.players).toEqual(DEFAULT_PLAYERS);
        expect(component.player).toEqual('');
        component.ngAfterViewInit();
        playersSubjectTest.next(playersTest);
        expect(component.players).toEqual(playersTest);
        expect(component.player).toEqual('');
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

    // it('should update the differences of cheat mode', () => {
    //     expect(component['cheatDifferences']).toBeUndefined();
    //     component.ngAfterViewInit();
    //     cheatDifferencesSubjectTest.next(cheatDifferenceTest);
    //     expect(component['cheatDifferences'].length).toEqual(cheatDifferenceTest.length);
    // });

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

    it('should call showEndGameDialog when receiving endMessage', () => {
        const showEndGameDialogSpy = spyOn(component, 'showEndGameDialog').and.callFake(() => {});
        component.ngAfterViewInit();
        endMessageTest.next(endGameMessageTest);
        expect(showEndGameDialogSpy).toHaveBeenCalled();
    });

    it('should do nothing if the left click on original image is not detected', () => {
        mouse = new MouseEvent('click', { button: 1 });
        component.mouseClickOnCanvas(mouse, false);
        expect(classicService['isLeftCanvas']).toBeFalsy();
    });

    it('should set isLeftCanvas to true if the left click on original image is detected', () => {
        const gameAreaSpy = spyOn(gameAreaService, 'setAllData');
        mouse = new MouseEvent('click', { button: 0 });
        component.mouseClickOnCanvas(mouse, true);
        expect(classicServiceSpy.setIsLeftCanvas).toHaveBeenCalledOnceWith(true);
        expect(gameAreaSpy).toHaveBeenCalled();
    });

    it('should do nothing if the left click on modified image is not detected', () => {
        mouse = new MouseEvent('click', { button: 1 });
        component.mouseClickOnCanvas(mouse, false);
        expect(classicService['isLeftCanvas']).toBeFalsy();
    });

    it('should set isLeftCanvas to false if the left click on modified image is detected', () => {
        const gameAreaSpy = spyOn(gameAreaService, 'setAllData');
        mouse = new MouseEvent('click', { button: 0 });
        component.mouseClickOnCanvas(mouse, false);
        expect(classicService['isLeftCanvas']).toBeFalsy();
        expect(gameAreaSpy).toHaveBeenCalled();
        expect(classicServiceSpy).toBeTruthy();
    });

    it('showAbandonDialog should open abandon dialog', () => {
        component.showAbandonDialog();
        expect(dialog.open).toHaveBeenCalled();
    });

    it('showEndGameDialog should call dialog.open with the correct arguments', () => {
        const endingMessage = 'Bravo !';
        clientSideGameTest.mode = 'Classic';
        component.game = clientSideGameTest;
        component.showEndGameDialog(endingMessage);
        expect(dialog.open).toHaveBeenCalled();
    });

    it('addRightSideMessage should add a message to the messages array and call ClassicService.sendMessage', () => {
        const text = 'Bravo !';
        const messagesLength = component.messages.length;
        component.addRightSideMessage(text);
        expect(messagesLength).toBeLessThan(component.messages.length);
        expect(classicServiceSpy.sendMessage).toHaveBeenCalledWith(text);
    });

    it('ngOnDestroy should unsubscribe from subscriptions', () => {
        component['gameSub'] = undefined as unknown as Subscription;
        component['timerSub'] = undefined as unknown as Subscription;
        component['differenceSub'] = undefined as unknown as Subscription;
        // component['routeParamSub'] = undefined as unknown as Subscription;
        component['opponentDifferenceSub'] = undefined as unknown as Subscription;
        component['messageSub'] = undefined as unknown as Subscription;
        component['endGameSub'] = undefined as unknown as Subscription;
        // component['cheatDifferencesSub'] = undefined as unknown as Subscription;
        const resetCheatModeSpy = spyOn(gameAreaService, 'resetCheatMode');
        component.ngOnDestroy();
        expect(resetCheatModeSpy).toHaveBeenCalled();
    });

    // it('should call toggleCheatMode when "t" key is pressed', () => {
    //     const toggleCheatModeSpy = spyOn(gameAreaService, 'toggleCheatMode').and.callFake(() => {});
    //     const event = new KeyboardEvent('keydown', { key: 't' });
    //     window.dispatchEvent(event);
    //     expect(toggleCheatModeSpy).toHaveBeenCalled();
    // });

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
        expect(classicServiceSpy.startGame).toHaveBeenCalled();
        expect(routeSpy.params).toEqual(paramsSubjectTest);
    });
});
