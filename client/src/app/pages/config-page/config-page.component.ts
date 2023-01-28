import { Component } from '@angular/core';
import { Game } from '@app/interfaces/game-interfaces';

@Component({
    selector: 'app-config-page',
    templateUrl: './config-page.component.html',
    styleUrls: ['./config-page.component.scss'],
})
export class ConfigPageComponent {
    readonly titre: string = 'Configure ton jeu';
    readonly imageSrc: string = '../../../assets/img/rat.jpg';
    readonly newImageSrc: string = '../../../assets/img/strong_rat.jpg';
    // eslint-disable-next-line no-alert, quotes, semi, @typescript-eslint/no-magic-numbers
    readonly gamePhase: number = 4;

    readonly createRoute: string = '/create';

    readonly timeCountdown: string = '30 secondes';
    readonly timePenalty: string = '5 secondes';
    readonly timeWonByDifference: string = '5 secondes';

    games: Game[] = [
        {
            id: 1,
            name: 'rat Game',
            difficultyLevel: 10,
            thumbnail: this.imageSrc,
            soloTopTime: [],
            oneVsOneTopTime: [],
            differencesCount: 15,
            hintList: [],
        },
        {
            id: 1,
            name: 'rat Game 2',
            difficultyLevel: 15,
            thumbnail: this.imageSrc,
            soloTopTime: [],
            oneVsOneTopTime: [],
            differencesCount: 15,
            hintList: [],
        },
        {
            id: 1,
            name: 'rat Game 3',
            difficultyLevel: 20,
            thumbnail: this.imageSrc,
            soloTopTime: [],
            oneVsOneTopTime: [],
            differencesCount: 15,
            hintList: [],
        },
        {
            id: 1,
            name: 'rat Game 4',
            difficultyLevel: 25,
            thumbnail: this.imageSrc,
            soloTopTime: [],
            oneVsOneTopTime: [],
            differencesCount: 15,
            hintList: [],
        },
        {
            id: 1,
            name: 'rat Game 4',
            difficultyLevel: 10,
            thumbnail: this.newImageSrc,
            soloTopTime: [],
            oneVsOneTopTime: [],
            differencesCount: 15,
            hintList: [],
        },
        {
            id: 1,
            name: 'rat Game 5',
            difficultyLevel: 15,
            thumbnail: this.newImageSrc,
            soloTopTime: [],
            oneVsOneTopTime: [],
            differencesCount: 15,
            hintList: [],
        },
        {
            id: 1,
            name: 'rat Game 6',
            difficultyLevel: 20,
            thumbnail: this.newImageSrc,
            soloTopTime: [],
            oneVsOneTopTime: [],
            differencesCount: 15,
            hintList: [],
        },
        {
            id: 1,
            name: 'rat Game 7',
            difficultyLevel: 25,
            thumbnail: this.newImageSrc,
            soloTopTime: [],
            oneVsOneTopTime: [],
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
