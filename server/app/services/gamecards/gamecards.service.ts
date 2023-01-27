import { GameCard, PlayerTime } from '@common/message';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GamecardsService {
    soloTopTime: PlayerTime[] = [
        {
            name: 'John Doe',
            time: 330,
        },
        {
            name: 'Jane Smith',
            time: 375,
        },
    ];
    oneVsOneTopTime: PlayerTime[] = [
        {
            name: 'John Doe',
            time: 225,
        },
        {
            name: 'Jane Smith',
            time: 270,
        },
    ];
    gameCards: GameCard[] = [
        {
            id: 1,
            name: 'Super Mario Bros.',
            difficultyLevel: 3,
            soloTopTime: this.soloTopTime,
            oneVsOneTopTime: this.oneVsOneTopTime,
            thumbnail: 'https://example.com/images/super_mario_thumbnail.jpg',
        },
        {
            id: 2,
            name: 'Super Racoon Bros.',
            difficultyLevel: 3,
            soloTopTime: this.soloTopTime,
            oneVsOneTopTime: this.oneVsOneTopTime,
            thumbnail: 'https://example.com/images/super_mario_thumbnail.jpg',
        },
        {
            id: 3,
            name: 'Super Rat Bros.',
            difficultyLevel: 3,
            soloTopTime: this.soloTopTime,
            oneVsOneTopTime: this.oneVsOneTopTime,
            thumbnail: 'https://example.com/images/super_mario_thumbnail.jpg',
        },
        {
            id: 4,
            name: 'Super Rat-Coon Bros.',
            difficultyLevel: 3,
            soloTopTime: this.soloTopTime,
            oneVsOneTopTime: this.oneVsOneTopTime,
            thumbnail: 'https://example.com/images/super_mario_thumbnail.jpg',
        },
    ];

    getGameCard(): GameCard[] {
        return this.gameCards;
    }
}
