/* eslint-disable no-unused-vars */
// Needed more lines for tests
/* eslint-disable max-lines */
// needed to spy on private functions
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
// Need to mock functions
import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { WAITING_TIME } from '@app/constants/constants';
import { REPLAY_LIMITER, SPEED_X1, SPEED_X2, SPEED_X4 } from '@app/constants/replay';
import { HintProximity } from '@app/enum/hint-proximity';
import { ReplayActions } from '@app/enum/replay-actions';
import { ClickErrorData, ReplayEvent } from '@app/interfaces/replay-actions';
import { CaptureService } from '@app/services//capture-service/capture.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { GameManagerService } from '@app/services/game-manager-service/game-manager.service';
import { HintService } from '@app/services/hint-service/hint.service';
import { ImageService } from '@app/services/image-service/image.service';
import { SoundService } from '@app/services/sound-service/sound.service';
import { Coordinate } from '@common/coordinate';
import { MessageTag } from '@common/enums';
import { ChatMessage, ClientSideGame, GameConfigConst, GameRoom, Player } from '@common/game-interfaces';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { ReplayService } from './replay.service';

describe('ReplayService', () => {
    let service: ReplayService;
    let gameAreaServiceSpy: jasmine.SpyObj<GameAreaService>;
    let gameManagerServiceSpy: jasmine.SpyObj<GameManagerService>;
    let soundServiceSpy: jasmine.SpyObj<SoundService>;
    let imageServiceSpy: jasmine.SpyObj<ImageService>;
    let hintServiceSpy: jasmine.SpyObj<HintService>;
    let captureServiceSpy: jasmine.SpyObj<CaptureService>;
    let replayEventsSubjectStub: Subject<ReplayEvent>;
    let timerCallbackSpy: jasmine.Spy<jasmine.Func> | (() => void);
    const replayEventGameManagerServiceSubTest = new BehaviorSubject<number>(0);

    const gameRoomStub: GameRoom = {
        roomId: 'test',
        clientGame: {} as ClientSideGame,
        endMessage: '',
        timer: 0,
        originalDifferences: [[]],
        gameConstants: {} as GameConfigConst,
        player1: {} as Player,
    };

    const replayEventsStub: ReplayEvent[] = [
        { timestamp: WAITING_TIME, action: ReplayActions.StartGame, data: gameRoomStub },
        { timestamp: WAITING_TIME * 2, action: ReplayActions.TimerUpdate },
        { timestamp: WAITING_TIME * 3, action: ReplayActions.ClickFound },
        { timestamp: WAITING_TIME * 2 * 2, action: ReplayActions.ClickError, data: { isMainCanvas: true, pos: { x: 0, y: 0 } } as ClickErrorData },
    ];

    const replayIntervalMock = {
        start: jasmine.createSpy('start'),
        pause: jasmine.createSpy('pause'),
        resume: jasmine.createSpy('resume'),
        cancel: jasmine.createSpy('cancel'),
    };

    beforeEach(() => {
        replayEventsSubjectStub = new Subject<ReplayEvent>();
        gameAreaServiceSpy = jasmine.createSpyObj(
            'GameAreaService',
            ['getOriginalContext', 'getModifiedContext', 'setAllData', 'replaceDifference', 'showError', 'toggleCheatMode', 'flashPixels'],
            {},
        );
        gameManagerServiceSpy = jasmine.createSpyObj('GameManagerService', ['setMessage', 'requestHint'], {
            replayEventsSubject: replayEventGameManagerServiceSubTest,
        });
        soundServiceSpy = jasmine.createSpyObj('SoundService', ['playCorrectSound', 'playErrorSound']);
        imageServiceSpy = jasmine.createSpyObj('ImageService', ['loadImage']);
        hintServiceSpy = jasmine.createSpyObj('HintService', ['requestHint', 'resetHints', 'deactivateThirdHint', 'switchProximity'], {});
        captureServiceSpy = jasmine.createSpyObj('CaptureService', ['capture'], { replayEventsSubject$: replayEventsSubjectStub });

        TestBed.configureTestingModule({
            providers: [
                ReplayService,
                { provide: GameAreaService, useValue: gameAreaServiceSpy },
                { provide: GameManagerService, useValue: gameManagerServiceSpy },
                { provide: SoundService, useValue: soundServiceSpy },
                { provide: ImageService, useValue: imageServiceSpy },
                { provide: HintService, useValue: hintServiceSpy },
                { provide: CaptureService, useValue: captureServiceSpy },
            ],
        });

        service = TestBed.inject(ReplayService);

        service['replayEvents'] = replayEventsStub;
    });

    beforeEach(() => {
        timerCallbackSpy = jasmine.createSpy('timerCallback');
        jasmine.clock().uninstall();
        jasmine.clock().install();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
        service.ngOnDestroy();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set isReplaying to true when startReplay is called', () => {
        service['replayEvents'] = replayEventsStub;
        service.startReplay();
        jasmine.clock().tick(WAITING_TIME);
        expect(service.isReplaying).toBeTruthy();
    });

    it('should call createReplayInterval and replaySwitcher when startReplay is called', () => {
        const createReplayIntervalSpy = spyOn<any>(service, 'createReplayInterval').and.callThrough();
        const replaySwitcherSpy = spyOn<any>(service, 'replaySwitcher');
        service['replayEvents'] = replayEventsStub;
        service.startReplay();
        jasmine.clock().tick(WAITING_TIME);
        expect(service.isReplaying).toBe(true);
        expect(createReplayIntervalSpy).toHaveBeenCalled();
        expect(replaySwitcherSpy).toHaveBeenCalled();
    });

    it('should call createReplayInterval and replaySwitcher when interval is paused and resumed', () => {
        const createReplayIntervalSpy = spyOn<any>(service, 'createReplayInterval').and.callThrough();
        const replaySwitcherSpy = spyOn<any>(service, 'replaySwitcher');
        service['currentReplayIndex'] = 0;
        service.startReplay();
        service.pauseReplay();
        service.resumeReplay();
        jasmine.clock().tick(WAITING_TIME);
        expect(service.isReplaying).toBe(true);
        expect(createReplayIntervalSpy).toHaveBeenCalled();
        expect(replaySwitcherSpy).toHaveBeenCalled();
    });

    it('should call createReplayInterval and replaySwitcher when interval is paused and resumed without waiting', () => {
        const createReplayIntervalSpy = spyOn<any>(service, 'createReplayInterval').and.callThrough();
        const replaySwitcherSpy = spyOn<any>(service, 'replaySwitcher');
        service['currentReplayIndex'] = 0;
        service.startReplay();
        service.pauseReplay();
        service.resumeReplay();
        jasmine.clock().tick(WAITING_TIME);
        expect(service.isReplaying).toBe(true);
        expect(createReplayIntervalSpy).toHaveBeenCalled();
        expect(replaySwitcherSpy).toHaveBeenCalled();
    });

    it('should call createReplayInterval and replaySwitcher when interval is paused and resumed without waiting', () => {
        const createReplayIntervalSpy = spyOn<any>(service, 'createReplayInterval').and.callThrough();
        const replaySwitcherSpy = spyOn<any>(service, 'replaySwitcher');
        service['currentReplayIndex'] = 0;
        service.startReplay();
        service.pauseReplay();
        service.resumeReplay();
        jasmine.clock().tick(WAITING_TIME);
        expect(service.isReplaying).toBe(true);
        expect(createReplayIntervalSpy).toHaveBeenCalled();
        expect(replaySwitcherSpy).toHaveBeenCalled();
    });

    it('getNextInterval should return REPLAY_LIMITER when currentReplayIndex is 0', () => {
        service['replayEvents'] = replayEventsStub;
        service['currentReplayIndex'] = 40;
        expect(service['getNextInterval']()).toEqual(REPLAY_LIMITER);
    });

    it('cancelReplay should call clearTimeout', () => {
        spyOn(window, 'setTimeout')
            .and.callThrough()
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- needed for test
            .and.returnValue(40 as unknown as ReturnType<typeof setTimeout>);
        const clearTimeoutSpy = spyOn(window, 'clearTimeout');
        service.startReplay();
        service['cancelReplay']();
        jasmine.clock().tick(WAITING_TIME);
        expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should call cancelReplay when replayEvents is empty', fakeAsync(() => {
        const cancelReplaySpy = spyOn<any>(service, 'cancelReplay').and.callThrough();
        service['replayEvents'] = [];
        service.startReplay();
        setTimeout(() => {
            expect(cancelReplaySpy).toHaveBeenCalled();
        }, REPLAY_LIMITER);
        expect(timerCallbackSpy).not.toHaveBeenCalled();
        flush();
    }));

    it('should call cancelReplay when replayEvents is over', fakeAsync(() => {
        const cancelReplaySpy = spyOn<any>(service, 'cancelReplay').and.callThrough();
        service['replayEvents'] = [];
        service.startReplay();
        service['currentReplayIndex'] = replayEventsStub.length;
        setTimeout(() => {
            expect(cancelReplaySpy).toHaveBeenCalled();
        }, REPLAY_LIMITER);
        expect(timerCallbackSpy).not.toHaveBeenCalled();
        flush();
    }));

    it('should stop the replay when there are no more events to process', () => {
        spyOn<any>(service, 'createReplayInterval').and.callFake((callback: (i: ReplayEvent) => void) => {
            return {
                start: () => {
                    for (const i of service['replayEvents']) {
                        callback(i);
                    }
                },
                pause: () => {},
                resume: () => {},
                cancel: () => {
                    service.isReplaying = false;
                },
            };
        });
        const replaySwitcherSpy = spyOn<any>(service, 'replaySwitcher').and.callThrough();
        service['replayEvents'] = replayEventsStub;
        service.startReplay();
        jasmine.clock().tick(WAITING_TIME);
        expect(service.isReplaying).toBe(true);
        expect(replaySwitcherSpy).toHaveBeenCalledTimes(replayEventsStub.length);
    });

    it('should handle StartGame action', () => {
        const replayEvent: ReplayEvent = {
            action: ReplayActions.StartGame,
            timestamp: 0,
            data: gameRoomStub,
        };
        service['replaySwitcher'](replayEvent);
        expect(imageServiceSpy.loadImage).toHaveBeenCalled();
        expect(gameAreaServiceSpy.setAllData).toHaveBeenCalled();
    });

    it('should handle ClickFound action', () => {
        const replayEvent: ReplayEvent = {
            action: ReplayActions.ClickFound,
            data: [
                { x: 10, y: 20 },
                { x: 30, y: 40 },
            ] as Coordinate[],
            timestamp: 0,
        };
        service['replaySwitcher'](replayEvent);
        expect(service['currentCoords']).toEqual(replayEvent.data as Coordinate[]);
        expect(service['isDifferenceFound']).toBe(true);
        expect(soundServiceSpy.playCorrectSound).toHaveBeenCalled();
        expect(gameAreaServiceSpy.setAllData).toHaveBeenCalled();
        expect(gameAreaServiceSpy.replaceDifference).toHaveBeenCalledWith(replayEvent.data as Coordinate[], service['replaySpeed']);
    });

    it('addReplayEvent should add a new event to the replayEvents array', () => {
        const pushSpy = spyOn(service['replayEvents'], 'push');
        const replayEvent: ReplayEvent = {
            action: ReplayActions.ClickFound,
            data: [] as Coordinate[],
            timestamp: 0,
        };
        service['addReplayEvent']();
        replayEventsSubjectStub.next(replayEvent);
        expect(pushSpy).toHaveBeenCalled();
    });

    it('addReplayEvent should not add a new event to the replayEvents array', () => {
        const pushSpy = spyOn(service['replayEvents'], 'push');
        replayEventsSubjectStub = undefined as unknown as Subject<ReplayEvent>;
        expect(pushSpy).not.toHaveBeenCalled();
    });

    it('ngOnDestroy should unsubscribe from replayEventsSubject', () => {
        const replayEventsSubjectSubscriptionSpy = spyOn(service['replayEventsSubjectSubscription'], 'unsubscribe');
        service['replayEventsSubjectSubscription'] = undefined as unknown as Subscription;
        service.ngOnDestroy();
        expect(replayEventsSubjectSubscriptionSpy).not.toHaveBeenCalled();
    });

    it('should handle ClickError action', () => {
        const replayEvent: ReplayEvent = {
            action: ReplayActions.ClickError,
            data: {
                isMainCanvas: true,
                pos: { x: 10, y: 20 },
            } as ClickErrorData,
            timestamp: 0,
        };
        service['replaySwitcher'](replayEvent);
        expect(soundServiceSpy.playErrorSound).toHaveBeenCalled();
        expect(gameAreaServiceSpy.showError).toHaveBeenCalledWith(
            (replayEvent.data as ClickErrorData).isMainCanvas,
            (replayEvent.data as ClickErrorData).pos,
            1,
        );
    });

    it('should handle CaptureMessage action', () => {
        const replayEvent: ReplayEvent = {
            action: ReplayActions.CaptureMessage,
            data: {
                tag: MessageTag.Common,
                message: 'test',
            } as ChatMessage,
            timestamp: 0,
        };
        service['replaySwitcher'](replayEvent);
        expect(gameManagerServiceSpy.setMessage).toHaveBeenCalledWith(replayEvent.data as ChatMessage);
    });

    it('should handle ActivateCheat action', () => {
        const replayEvent: ReplayEvent = {
            action: ReplayActions.ActivateCheat,
            data: [
                { x: 10, y: 20 },
                { x: 30, y: 40 },
            ] as Coordinate[],
            timestamp: 0,
        };
        service['replaySwitcher'](replayEvent);
        expect(service['isCheatMode']).toBe(true);
        expect(service['currentCoords']).toEqual(replayEvent.data as Coordinate[]);
        expect(gameAreaServiceSpy.toggleCheatMode).toHaveBeenCalledWith(replayEvent.data as Coordinate[], service['replaySpeed']);
    });

    it('should handle DeactivateCheat action', () => {
        const replayEvent: ReplayEvent = {
            action: ReplayActions.DeactivateCheat,
            data: [
                { x: 10, y: 20 },
                { x: 30, y: 40 },
            ] as Coordinate[],
            timestamp: 0,
        };
        service['replaySwitcher'](replayEvent);
        expect(service['isCheatMode']).toBe(false);
        expect(gameAreaServiceSpy.toggleCheatMode).toHaveBeenCalledWith(replayEvent.data as Coordinate[], service['replaySpeed']);
    });

    it('should handle TimerUpdate action', () => {
        const replayEvent: ReplayEvent = {
            action: ReplayActions.TimerUpdate,
            timestamp: 0,
        };
        const timerValues: number[] = [];
        service['replayTimer$'].subscribe((value) => {
            timerValues.push(value);
        });
        expect(timerValues.length).toEqual(1);
        service['replaySwitcher'](replayEvent);
        expect(timerValues.length).toEqual(2);
    });

    it('should handle DifferenceFoundUpdate action', () => {
        const replayEvent: ReplayEvent = {
            action: ReplayActions.DifferenceFoundUpdate,
            data: 3,
            timestamp: 0,
        };
        const differenceFoundValues: number[] = [];
        service['replayDifferenceFound$'].subscribe((value) => {
            differenceFoundValues.push(value);
        });
        expect(differenceFoundValues).toEqual([0]);
        service['replaySwitcher'](replayEvent);
        expect(differenceFoundValues).toEqual([0, replayEvent.data as number]);
    });

    it('should handle OpponentDifferencesFoundUpdate action', () => {
        const replayEvent: ReplayEvent = {
            action: ReplayActions.OpponentDifferencesFoundUpdate,
            data: 2,
            timestamp: 0,
        };
        const opponentDifferenceFoundValues: number[] = [];
        service['replayOpponentDifferenceFound$'].subscribe((value) => {
            opponentDifferenceFoundValues.push(value);
        });
        expect(opponentDifferenceFoundValues).toEqual([0]);
        service['replaySwitcher'](replayEvent);
        expect(opponentDifferenceFoundValues).toEqual([0, replayEvent.data as number]);
    });

    it('should handle UseHint action', () => {
        const replayEvent: ReplayEvent = {
            action: ReplayActions.UseHint,
            data: [
                { x: 10, y: 20 },
                { x: 30, y: 40 },
            ] as Coordinate[],
            timestamp: 0,
        };
        service['replaySwitcher'](replayEvent);
        expect(hintServiceSpy.requestHint).toHaveBeenCalledWith(replayEvent.data as Coordinate[], service['replaySpeed']);
    });

    it('should handle ActivateThirdHint action', () => {
        const replayEvent: ReplayEvent = {
            action: ReplayActions.ActivateThirdHint,
            data: HintProximity.OnIt as number,
            timestamp: 0,
        };
        service['replaySwitcher'](replayEvent);
        expect(hintServiceSpy.switchProximity).toHaveBeenCalledWith(replayEvent.data as number);
    });

    it('should handle DeactivateThirdHint action', () => {
        const replayEvent: ReplayEvent = {
            action: ReplayActions.DeactivateThirdHint,
            timestamp: 0,
        };
        service['replaySwitcher'](replayEvent);
        expect(hintServiceSpy.deactivateThirdHint).toHaveBeenCalled();
    });

    it('should call toggleCheatMode and flashPixels when isCheatMode and isDifferenceFound are true', () => {
        service['replayInterval'] = replayIntervalMock;
        service['isCheatMode'] = true;
        service['isDifferenceFound'] = true;
        service.pauseReplay();
        expect(gameAreaServiceSpy.toggleCheatMode).toHaveBeenCalledWith(service['currentCoords'], service['replaySpeed']);
        expect(gameAreaServiceSpy.flashPixels).toHaveBeenCalledWith(service['currentCoords'], service['replaySpeed'], true);
        expect(replayIntervalMock.pause).toHaveBeenCalled();
    });

    it('should call toggleCheatMode and flashPixels when isCheatMode and isDifferenceFound are true', () => {
        service['replayInterval'] = replayIntervalMock;
        service['isCheatMode'] = true;
        service['isDifferenceFound'] = true;
        service.resumeReplay();
        expect(gameAreaServiceSpy.toggleCheatMode).toHaveBeenCalledWith(service['currentCoords'], service['replaySpeed']);
        expect(gameAreaServiceSpy.flashPixels).toHaveBeenCalledWith(service['currentCoords'], service['replaySpeed'], false);
        expect(replayIntervalMock.resume).toHaveBeenCalled();
    });

    it('should set replaySpeed to SPEED_X1', () => {
        service.upSpeed(SPEED_X1);
        expect(service['replaySpeed']).toBe(SPEED_X1);
    });

    it('should speed up the flashing for cheat mode when up speed', () => {
        service['isCheatMode'] = true;
        service.upSpeed(SPEED_X1);
        expect(service['replaySpeed']).toBe(SPEED_X1);
    });

    it('should set replaySpeed to SPEED_X2', () => {
        service.upSpeed(SPEED_X2);
        expect(service['replaySpeed']).toBe(SPEED_X2);
    });

    it('should set replaySpeed to SPEED_X4', () => {
        service.upSpeed(SPEED_X4);
        expect(service['replaySpeed']).toBe(SPEED_X4);
    });

    it('should reset replay timer and found differences', () => {
        service.restartTimer();
        expect(service['replayOpponentDifferenceFound'].value).toBe(0);
        expect(service['replayDifferenceFound'].value).toBe(0);
        expect(service['replayTimer'].value).toBe(0);
    });

    it('should reset replay properties', () => {
        service.resetReplay();
        expect(service['replayEvents']).toEqual([]);
        expect(service['currentReplayIndex']).toBe(0);
        expect(service['isReplaying']).toBe(false);
    });

    it('should reset the currentReplayIndex and resume the replay', () => {
        service['currentReplayIndex'] = 5;
        service['replayInterval'] = replayIntervalMock;
        service.restartReplay();
        jasmine.clock().tick(WAITING_TIME);
        expect(service['currentReplayIndex']).toBe(0);
        expect(replayIntervalMock.resume).toHaveBeenCalled();
    });
});
