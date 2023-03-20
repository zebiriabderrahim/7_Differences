import { TestBed } from '@angular/core/testing';
import { SoundService } from './sound.service';

describe('SoundService', () => {
    let soundService: SoundService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        soundService = TestBed.inject(SoundService);
    });

    it('should be created', () => {
        expect(soundService).toBeTruthy();
    });

    it('playErrorSound should play error sound', () => {
        const incorrectSoundEffectPlaySpy = spyOn(soundService['incorrectSoundEffect'], 'play').and.returnValue(Promise.resolve());
        soundService.playErrorSound();
        expect(incorrectSoundEffectPlaySpy).toHaveBeenCalled();
    });

    it('playCorrectSound should play correct sound', () => {
        const correctSoundEffectPlaySpy = spyOn(soundService['correctSoundEffect'], 'play').and.returnValue(Promise.resolve());
        soundService.playCorrectSound();
        expect(correctSoundEffectPlaySpy).toHaveBeenCalled();
    });
});
