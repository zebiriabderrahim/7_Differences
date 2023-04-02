/* eslint-disable @typescript-eslint/no-empty-function */
// Need to mock functions
import { TestBed } from '@angular/core/testing';
import { ReplayActions } from '@app/enum/replay-actions';
import { ClickErrorData, ReplayEvent } from '@app/interfaces/replay-actions';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { ImageService } from '@app/services/image-service/image.service';
import { SoundService } from '@app/services/sound-service/sound.service';
import { Coordinate } from '@common/coordinate';
import { MessageTag } from '@common/enums';
import { ChatMessage } from '@common/game-interfaces';
import { BehaviorSubject } from 'rxjs';
import { ReplayService } from './replay.service';

describe('ReplayService', () => {
    let service: ReplayService;
    let gameAreaServiceSpy: jasmine.SpyObj<GameAreaService>;
    let classicSystemServiceSpy: jasmine.SpyObj<ClassicSystemService>;
    let soundServiceSpy: jasmine.SpyObj<SoundService>;
    let imageServiceSpy: jasmine.SpyObj<ImageService>;
    const replayEventGameAreaServiceSubTest = new BehaviorSubject<number>(0);
    const replayEventClassicSystemServiceSubTest = new BehaviorSubject<number>(0);

    const replayEventsStub: ReplayEvent[] = [
        { timestamp: 0, action: ReplayActions.StartGame, data: ['0', '1'] },
        { timestamp: 0, action: ReplayActions.TimerUpdate },
        { timestamp: 0, action: ReplayActions.ClickFound, data: ['og', 'md'] },
        { timestamp: 0, action: ReplayActions.ClickError, data: { isMainCanvas: true, pos: { x: 0, y: 0 } } as ClickErrorData },
    ];

    beforeEach(async () => {
        gameAreaServiceSpy = jasmine.createSpyObj(
            'GameAreaService',
            ['getOgContext', 'getMdContext', 'setAllData', 'replaceDifference', 'showError', 'toggleCheatMode', 'flashCorrectPixels'],
            {
                replayEventsSubject: replayEventGameAreaServiceSubTest,
            },
        );
        classicSystemServiceSpy = jasmine.createSpyObj('ClassicSystemService', ['setMessage'], {
            replayEventsSubject: replayEventClassicSystemServiceSubTest,
        });
        soundServiceSpy = jasmine.createSpyObj('SoundService', ['playCorrectSound', 'playErrorSound']);
        imageServiceSpy = jasmine.createSpyObj('ImageService', ['loadImage']);

        TestBed.configureTestingModule({
            providers: [
                ReplayService,
                { provide: GameAreaService, useValue: gameAreaServiceSpy },
                { provide: ClassicSystemService, useValue: classicSystemServiceSpy },
                { provide: SoundService, useValue: soundServiceSpy },
                { provide: ImageService, useValue: imageServiceSpy },
            ],
        });

        service = TestBed.inject(ReplayService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set isReplaying to true when startReplay is called', () => {
        service.startReplay();
        expect(service.isReplaying).toBe(true);
    });

    it('should call createReplayInterval and replaySwitcher when startReplay is called', () => {
        const createReplayIntervalSpy = spyOn(service, 'createReplayInterval').and.callThrough();
        const replaySwitcherSpy = spyOn(service, 'replaySwitcher');

        service['replayEvents'] = replayEventsStub;

        service.startReplay();

        expect(service.isReplaying).toBe(true);
        expect(createReplayIntervalSpy).toHaveBeenCalled();
        expect(replaySwitcherSpy).toHaveBeenCalledTimes(1);
    });

    it('should call createReplayInterval and replaySwitcher when interval is paused and resumed', () => {
        const createReplayIntervalSpy = spyOn(service, 'createReplayInterval').and.callThrough();
        const replaySwitcherSpy = spyOn(service, 'replaySwitcher');

        service['replayEvents'] = replayEventsStub;

        service.startReplay();

        service.pauseReplay();
        service.resumeReplay();

        expect(service.isReplaying).toBe(true);
        expect(createReplayIntervalSpy).toHaveBeenCalled();
        expect(replaySwitcherSpy).toHaveBeenCalledTimes(2);
    });

    it('should stop the replay when there are no more events to process', () => {
        spyOn(service, 'createReplayInterval').and.callFake((callback: (i: ReplayEvent) => void) => {
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

        const replaySwitcherSpy = spyOn(service, 'replaySwitcher').and.callThrough();
        const cancelReplaySpy = spyOn(service, 'cancelReplay').and.callThrough();

        service['replayEvents'] = replayEventsStub;

        service.startReplay();

        expect(service.isReplaying).toBe(true);
        expect(replaySwitcherSpy).toHaveBeenCalledTimes(replayEventsStub.length);

        service.cancelReplay();

        expect(cancelReplaySpy).toHaveBeenCalled();
        expect(service.isReplaying).toBe(false);
    });

    it('should handle StartGame action', () => {
        const replayEvent: ReplayEvent = {
            action: ReplayActions.StartGame,
            data: ['image1', 'image2'],
            timestamp: 0,
        };

        service.replaySwitcher(replayEvent);

        expect(imageServiceSpy.loadImage.calls.allArgs()).toEqual([
            [service['gameAreaService'].getOgContext(), 'image1'],
            [service['gameAreaService'].getMdContext(), 'image2'],
        ]);
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

        service.replaySwitcher(replayEvent);

        expect(service['currentCoords']).toEqual(replayEvent.data as Coordinate[]);
        expect(service['isDifferenceFound']).toBe(true);

        expect(soundServiceSpy.playCorrectSound).toHaveBeenCalled();
        expect(gameAreaServiceSpy.setAllData).toHaveBeenCalled();
        expect(gameAreaServiceSpy.replaceDifference).toHaveBeenCalledWith(replayEvent.data as Coordinate[]);
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

        service.replaySwitcher(replayEvent);

        expect(soundServiceSpy.playErrorSound).toHaveBeenCalled();
        expect(gameAreaServiceSpy.showError).toHaveBeenCalledWith(
            (replayEvent.data as ClickErrorData).isMainCanvas,
            (replayEvent.data as ClickErrorData).pos,
        );
    });

    it('should handle CaptureMessage action', () => {
        const replayEvent: ReplayEvent = {
            action: ReplayActions.CaptureMessage,
            data: {
                tag: MessageTag.common,
                message: 'test',
            } as ChatMessage,
            timestamp: 0,
        };

        service.replaySwitcher(replayEvent);

        expect(classicSystemServiceSpy.setMessage).toHaveBeenCalledWith(replayEvent.data as ChatMessage);
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

        service.replaySwitcher(replayEvent);

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

        service.replaySwitcher(replayEvent);

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

        expect(timerValues).toEqual([0]);

        service.replaySwitcher(replayEvent);

        expect(timerValues).toEqual([0, 1]);
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

        service.replaySwitcher(replayEvent);

        expect(differenceFoundValues).toEqual([0, replayEvent.data as number]);
    });

    it('should handle OpponentDifferencesFoundUpdate action', () => {
        const replayEvent: ReplayEvent = {
            action: ReplayActions.OpponentDifferencesFoundUpdate,
            data: 2,
            timestamp: 0,
        };

        const initialReplayOpponentDifferenceFound = service['replayOpponentDifferenceFound'].value;

        service.replaySwitcher(replayEvent);

        expect(service['replayOpponentDifferenceFound'].value).toBe(initialReplayOpponentDifferenceFound + (replayEvent.data as number));
    });
});
