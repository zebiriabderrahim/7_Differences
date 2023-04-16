import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SoundService {
    private correctSoundEffect: HTMLAudioElement;
    private incorrectSoundEffect: HTMLAudioElement;
    private backgroundMusic: HTMLAudioElement;

    constructor() {
        this.correctSoundEffect = new Audio('assets/sound/WinSoundEffect.mp3');
        this.incorrectSoundEffect = new Audio('assets/sound/ErrorSoundEffect.mp3');
        this.backgroundMusic = new Audio('assets/sound/DingDongMusic.mp3');
    }

    playErrorSound(): void {
        this.incorrectSoundEffect.play();
    }

    playCorrectSound(): void {
        this.correctSoundEffect.play();
    }

    loopBackgroundMusic(): void {
        this.backgroundMusic.loop = true;
        this.backgroundMusic.play();
    }

    stopBackgroundMusic(): void {
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;
    }
}
