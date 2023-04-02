import { TestBed } from '@angular/core/testing';
import { ReplayActions } from '@app/enum/replay-actions';
import { ClickErrorData, ReplayEvent } from '@app/interfaces/replay-actions';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { ImageService } from '@app/services/image-service/image.service';
import { SoundService } from '@app/services/sound-service/sound.service';
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
    });

    it('should handle ClickError action', () => {
    });

    it('should handle CaptureMessage action', () => {
    });

    it('should handle ActivateCheat action', () => {
    });

    it('should handle DeactivateCheat action', () => {
    });
});
