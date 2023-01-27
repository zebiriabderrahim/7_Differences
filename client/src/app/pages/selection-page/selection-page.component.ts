import { Component } from '@angular/core';
import { Game } from '@app/interfaces/game-interfaces';

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

    games: Game[] = [
        {
            id: 1,
            name: 'rat Game',
            difficultyLevel: 10,
            thumbnail: this.imageSrc,
            soloTopTime: [
                { name: 'player1', time: 1.5 },
                { name: 'player2', time: 2.5 },
                { name: 'player3', time: 3.5 },
            ],
            oneVsOneTopTime: [
                { name: 'player1', time: 1.5 },
                { name: 'player2', time: 2.5 },
                { name: 'player3', time: 3.5 },
            ],
            differencesCount: 15,
            hintList: [],
        },
        {
            id: 1,
            name: 'rat Game 2',
            difficultyLevel: 15,
            thumbnail: this.imageSrc,
            soloTopTime: [
                { name: 'player1', time: 1.5 },
                { name: 'player2', time: 2.5 },
                { name: 'player3', time: 3.5 },
            ],
            oneVsOneTopTime: [
                { name: 'player1', time: 1.5 },
                { name: 'player2', time: 2.5 },
                { name: 'player3', time: 3.5 },
            ],
            differencesCount: 15,
            hintList: [],
        },
        {
            id: 1,
            name: 'rat Game 3',
            difficultyLevel: 20,
            thumbnail: this.imageSrc,
            soloTopTime: [
                { name: 'player1', time: 1.5 },
                { name: 'player2', time: 2.5 },
                { name: 'player3', time: 3.5 },
            ],
            oneVsOneTopTime: [
                { name: 'player1', time: 1.5 },
                { name: 'player2', time: 2.5 },
                { name: 'player3', time: 3.5 },
            ],
            differencesCount: 15,
            hintList: [],
        },
        {
            id: 1,
            name: 'rat Game 4',
            difficultyLevel: 25,
            thumbnail: this.imageSrc,
            soloTopTime: [
                { name: 'player1', time: 1.5 },
                { name: 'player2', time: 2.5 },
                { name: 'player3', time: 3.5 },
            ],
            oneVsOneTopTime: [
                { name: 'player1', time: 1.5 },
                { name: 'player2', time: 2.5 },
                { name: 'player3', time: 3.5 },
            ],
            differencesCount: 15,
            hintList: [],
        },
        {
            id: 1,
            name: 'rat Game 4',
            difficultyLevel: 10,
            thumbnail: this.newImageSrc,
            soloTopTime: [
                { name: 'player1', time: 1.5 },
                { name: 'player2', time: 2.5 },
                { name: 'player3', time: 3.5 },
            ],
            oneVsOneTopTime: [
                { name: 'player1', time: 1.5 },
                { name: 'player2', time: 2.5 },
                { name: 'player3', time: 3.5 },
            ],
            differencesCount: 15,
            hintList: [],
        },
        {
            id: 1,
            name: 'rat Game 5',
            difficultyLevel: 15,
            thumbnail: this.newImageSrc,
            soloTopTime: [
                { name: 'player1', time: 1.5 },
                { name: 'player2', time: 2.5 },
                { name: 'player3', time: 3.5 },
            ],
            oneVsOneTopTime: [
                { name: 'player1', time: 1.5 },
                { name: 'player2', time: 2.5 },
                { name: 'player3', time: 3.5 },
            ],
            differencesCount: 15,
            hintList: [],
        },
        {
            id: 1,
            name: 'rat Game 6',
            difficultyLevel: 20,
            thumbnail: this.newImageSrc,
            soloTopTime: [
                { name: 'player1', time: 1.5 },
                { name: 'player2', time: 2.5 },
                { name: 'player3', time: 3.5 },
            ],
            oneVsOneTopTime: [
                { name: 'player1', time: 1.5 },
                { name: 'player2', time: 2.5 },
                { name: 'player3', time: 3.5 },
            ],
            differencesCount: 15,
            hintList: [],
        },
        {
            id: 1,
            name: 'rat Game 7',
            difficultyLevel: 25,
            thumbnail: this.newImageSrc,
            soloTopTime: [
                { name: 'player1', time: 1.5 },
                { name: 'player2', time: 2.5 },
                { name: 'player3', time: 3.5 },
            ],
            oneVsOneTopTime: [
                { name: 'player1', time: 1.5 },
                { name: 'player2', time: 2.5 },
                { name: 'player3', time: 3.5 },
            ],
            differencesCount: 15,
            hintList: [],
        },
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
        if (this.gameIterator >= this.games.length - this.gamePhase) {
            this.hasNext = false;
        }
    }
}
