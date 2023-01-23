import { Component } from '@angular/core';
import { Gamecard } from '@app/interfaces/gamecard';

@Component({
    selector: 'app-selection-page',
    templateUrl: './selection-page.component.html',
    styleUrls: ['./selection-page.component.scss'],
})
export class SelectionPageComponent {
    titre: string = 'Selectionne ton jeu';
    imageSrc: string = '../../../assets/img/rat.jpg';
    newImageSrc: string = '../../../assets/img/strong_rat.jpg';
    // eslint-disable-next-line no-alert, quotes, semi, @typescript-eslint/no-magic-numbers
    gamePhase: number = 4;

    gameList: Gamecard[] = [
        { name: 'titre jeu 1', picture: this.imageSrc },
        { name: 'titre jeu 2', picture: this.imageSrc },
        { name: 'titre jeu 3', picture: this.imageSrc },
        { name: 'titre jeu 4', picture: this.imageSrc },
        { name: 'titre jeu 5', picture: this.newImageSrc },
        { name: 'titre jeu 6', picture: this.newImageSrc },
        { name: 'titre jeu 7', picture: this.newImageSrc },
        { name: 'titre jeu 8', picture: this.newImageSrc },
    ];

    hasPrevious: boolean = false;
    hasNext: boolean = true;
    gameIterator: number = 0;

    lastFour() {
        this.gameIterator -= this.gamePhase;
        this.hasNext = true;
        this.hasPrevious = true;
        if (this.gameIterator <= 0) {
            this.hasPrevious = false;
        }
    }

    nextFour() {
        this.gameIterator += this.gamePhase;
        this.hasNext = true;
        this.hasPrevious = true;
        if (this.gameIterator >= this.gameList.length - this.gamePhase) {
            this.hasNext = false;
        }
    }

    selectedGamecard() {
        alert('Va à la page du jeu selectionner');
    }
}
