import { GAME_CARROUSEL_SIZE } from '@common/constants';
import { CarrouselPaginator, GameCard, Game } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameListsService {
    buildGameCarrousel(gameCardsList: GameCard[], carrouselGames: CarrouselPaginator[]): void {
        for (let i = 0; i < gameCardsList.length; i += GAME_CARROUSEL_SIZE) {
            const j = i;
            const gameCarrousel: CarrouselPaginator = {
                hasNext: i + GAME_CARROUSEL_SIZE < gameCardsList.length,
                hasPrevious: j > 0,
                gameCards: gameCardsList.slice(j, i + GAME_CARROUSEL_SIZE),
            };
            carrouselGames.push(gameCarrousel);
        }
    }

    buildGameCardsList(games: Game[]): GameCard[] {
        return games.map((game) => ({
            id: game.id,
            name: game.name,
            difficultyLevel: game.difficultyLevel,
            soloTopTime: game.soloTopTime,
            oneVsOneTopTime: game.oneVsOneTopTime,
            thumbnail: game.thumbnail,
        }));
    }
}
