import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SoundService {
    private correctSoundEffect: HTMLAudioElement;
    private incorrectSoundEffect: HTMLAudioElement;
    private backgroundMusic: HTMLAudioElement;
    private gameMusic: HTMLAudioElement;

    constructor() {
        this.correctSoundEffect = new Audio('assets/sound/WinSoundEffect.mp3');
        this.incorrectSoundEffect = new Audio('assets/sound/ErrorSoundEffect.mp3');
        this.backgroundMusic = new Audio('assets/sound/BackgroundMusic.mp3');
        this.gameMusic = new Audio('assets/sound/GameMusic.mp3');
        this.backgroundMusic.loop = true;
        this.gameMusic.loop = true;
        this.backgroundMusic.volume = 0.02;
        this.gameMusic.volume = 0.02;
    }

    playErrorSound(): void {
        this.incorrectSoundEffect.play();
    }

    playCorrectSound(): void {
        this.correctSoundEffect.play();
    }

    loopBackgroundMusic(): void {
        this.backgroundMusic.play();
    }

    stopBackgroundMusic(): void {
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;
    }

    loopGameMusic(): void {
        this.gameMusic.play();
    }

    stopGameMusic(): void {
        this.gameMusic.pause();
        this.gameMusic.currentTime = 0;
        this.backgroundMusic.play();
    }
}
