import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-selection-page',
    templateUrl: './selection-page.component.html',
    styleUrls: ['./selection-page.component.scss'],
})
export class SelectionPageComponent implements OnInit {
    constructor() {}

    ngOnInit(): void {}

    titre = 'Selectionne ton jeux';

    imageSrc: string = '../../../assets/img/rat.jpg';
    newImageSrc: string = '../../../assets/img/strong_rat.jpg';

    gameList = [
        { name: 'titre jeu 1', picture: this.imageSrc },
        { name: 'titre jeu 2', picture: this.imageSrc },
        { name: 'titre jeu 3', picture: this.imageSrc },
        { name: 'titre jeu 4', picture: this.imageSrc },
        { name: 'titre jeu 5', picture: this.newImageSrc },
        { name: 'titre jeu 6', picture: this.newImageSrc },
        { name: 'titre jeu 7', picture: this.newImageSrc },
        { name: 'titre jeu 8', picture: this.newImageSrc },
    ];

    gameIterator = 0;

    previewAction() {
        this.gameIterator--;
        this.gameIterator--;
        this.gameIterator--;
        this.gameIterator--;
    }

    nextAction() {
        this.gameIterator++;
        this.gameIterator++;
        this.gameIterator++;
        this.gameIterator++;
    }

    selectedGame() {
        alert('Va à la page du jeu selectionner');
    }
}
