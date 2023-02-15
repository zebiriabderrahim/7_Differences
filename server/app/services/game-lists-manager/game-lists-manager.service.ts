import { Game } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { GAME_CARROUSEL_SIZE } from '@common/constants';
import { CarouselPaginator, GameCard, PlayerTime, ServerSideGame } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class GameListsManagerService {
    private defaultBestTimes: PlayerTime[] = [
        { name: 'John Doe', time: 100 },
        { name: 'Jane Doe', time: 200 },
        { name: 'the scream', time: 250 },
    ];

    buildGameCardFromGame(game: Game): GameCard {
        const gameCard: GameCard = {
            // Id comes from database to allow _id
            // eslint-disable-next-line no-param-reassign, no-underscore-dangle
            id: game._id,
            name: game.name,
            difficultyLevel: game.isHard,
            soloTopTime: this.defaultBestTimes,
            oneVsOneTopTime: this.defaultBestTimes,
            thumbnail: fs.readFileSync(`assets/${game.name}/original.bmp`, 'base64'),
        };
        return gameCard;
    }

    addGameCarousel(gameCard: GameCard, carouselGames: CarouselPaginator[]): void {
        let lastIndex: number = carouselGames.length - 1;
        if (carouselGames[lastIndex].gameCards.length < GAME_CARROUSEL_SIZE) {
            carouselGames[lastIndex].gameCards.push(gameCard);
        } else {
            carouselGames.push({
                hasNext: false,
                hasPrevious: true,
                gameCards: [],
            });
            carouselGames[lastIndex].hasNext = true;
            carouselGames[++lastIndex].gameCards.push(gameCard);
        }
    }
    buildGameCarousel(gameCards: GameCard[], carouselGames: CarouselPaginator[]): void {
        if (carouselGames.length === 0) {
            carouselGames.push({
                hasNext: false,
                hasPrevious: false,
                gameCards: [],
            });
            for (const gameCard of gameCards) {
                this.addGameCarousel(gameCard, carouselGames);
            }
        }
    }
    createGameFromGameDto(newGame: CreateGameDto): ServerSideGame {
        return {
            id: '',
            name: newGame.name,
            original: newGame.originalImage,
            modified: newGame.modifiedImage,
            differences: newGame.differences,
            differencesCount: newGame.nDifference,
            isHard: newGame.isHard,
        };
    }
}
