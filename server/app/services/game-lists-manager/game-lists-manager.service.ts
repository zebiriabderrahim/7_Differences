import { Game, GameCard, CarouselPaginator, PlayerTime } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import { GAME_CARROUSEL_SIZE } from '@common/constants';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';

@Injectable()
export class GameListsManagerService {
    private defaultBestTimes: PlayerTime[] = [
        { name: 'John Doe', time: 100 },
        { name: 'Jane Doe', time: 200 },
        { name: 'the scream', time: 250 },
    ];

    buildGameCardFromGame(game: Game): GameCard {
        const gameCard: GameCard = {
            id: game.id,
            name: game.name,
            difficultyLevel: game.difficultyLevel,
            soloTopTime: game.soloTopTime,
            oneVsOneTopTime: game.oneVsOneTopTime,
            thumbnail: game.thumbnail,
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
    createGameFromGameDto(newGame: CreateGameDto): Game {
        return {
            id: newGame.id,
            name: newGame.name,
            original: newGame.originalImage,
            modified: newGame.modifiedImage,
            soloTopTime: this.defaultBestTimes,
            oneVsOneTopTime: this.defaultBestTimes,
            difficultyLevel: newGame.isHard,
            thumbnail: newGame.modifiedImage,
            differencesCount: newGame.nDifference,
            hintList: [],
        };
    }
}
