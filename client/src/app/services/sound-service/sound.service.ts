import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SoundService {
    private correctSoundEffect: HTMLAudioElement;
    private incorrectSoundEffect: HTMLAudioElement;

    constructor() {
        this.correctSoundEffect = new Audio('assets/sound/WinSoundEffect.mp3');
        this.incorrectSoundEffect = new Audio('assets/sound/ErrorSoundEffect.mp3');
    }

    playErrorSound(): void {
        this.incorrectSoundEffect.play();
    }

    playCorrectSound(): void {
        this.correctSoundEffect.play();
    }
}
