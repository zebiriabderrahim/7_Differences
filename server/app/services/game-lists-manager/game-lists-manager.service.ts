import { Game } from '@app/model/database/game';
import { GAME_CARROUSEL_SIZE } from '@common/constants';
import { CarouselPaginator, GameCard, PlayerTime } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class GameListsManagerService {
    private carouselGames: CarouselPaginator[] = [];
    private defaultBestTimes: PlayerTime[] = [
        { name: 'John Doe', time: 100 },
        { name: 'Jane Doe', time: 200 },
        { name: 'the scream', time: 250 },
    ];

    buildGameCardFromGame(game: Game): GameCard {
        const gameCard: GameCard = {
            // Id comes from database to allow _id
            // eslint-disable-next-line no-param-reassign, no-underscore-dangle
            _id: game._id,
            name: game.name,
            difficultyLevel: game.isHard,
            soloTopTime: this.defaultBestTimes,
            oneVsOneTopTime: this.defaultBestTimes,
            thumbnail: `assets/${game.name}/original.bmp`,
        };
        return gameCard;
    }

    addGameCarousel(gameCard: GameCard): void {
        let lastIndex: number = this.carouselGames.length - 1;
        gameCard.thumbnail = fs.readFileSync(gameCard.thumbnail, 'base64');
        if (this.carouselGames[lastIndex].gameCards.length < GAME_CARROUSEL_SIZE) {
            this.carouselGames[lastIndex].gameCards.push(gameCard);
        } else {
            this.carouselGames.push({
                hasNext: false,
                hasPrevious: true,
                gameCards: [],
            });
            this.carouselGames[lastIndex].hasNext = true;
            this.carouselGames[++lastIndex].gameCards.push(gameCard);
        }
    }
    buildGameCarousel(gameCards: GameCard[]): void {
        if (this.carouselGames.length === 0) {
            this.carouselGames.push({
                hasNext: false,
                hasPrevious: false,
                gameCards: [],
            });
            for (const gameCard of gameCards) {
                this.addGameCarousel(gameCard);
            }
        }
    }
}
