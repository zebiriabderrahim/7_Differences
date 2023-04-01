import { TestBed } from '@angular/core/testing';
import { ReplayActions } from '@app/enum/replay-actions';
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

    beforeEach(() => {
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

        service['replayEvents'] = [{ timestamp: 0, action: ReplayActions.StartGame, data: ['0', '1'] }];

        service.startReplay();

        expect(service.isReplaying).toBe(true);
        expect(createReplayIntervalSpy).toHaveBeenCalled();
        expect(replaySwitcherSpy).toHaveBeenCalledTimes(1);
    });
});
