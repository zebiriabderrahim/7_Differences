import { TestBed } from '@angular/core/testing';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { ImageService } from '@app/services/image-service/image.service';
import { SoundService } from '@app/services/sound-service/sound.service';
import { ReplayService } from './replay.service';

describe('ReplayService', () => {
    let service: ReplayService;
    let gameAreaServiceSpy: jasmine.SpyObj<GameAreaService>;
    let classicSystemServiceSpy: jasmine.SpyObj<ClassicSystemService>;
    let soundServiceSpy: jasmine.SpyObj<SoundService>;
    let imageServiceSpy: jasmine.SpyObj<ImageService>;

    beforeEach(() => {
        gameAreaServiceSpy = jasmine.createSpyObj('GameAreaService', []);
        classicSystemServiceSpy = jasmine.createSpyObj('ClassicSystemService', []);
        soundServiceSpy = jasmine.createSpyObj('SoundService', []);
        imageServiceSpy = jasmine.createSpyObj('ImageService', []);

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
});
