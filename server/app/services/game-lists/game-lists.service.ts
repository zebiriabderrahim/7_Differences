import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { GAME_CARROUSEL_SIZE } from '@common/constants';
import { GameCarrousel, GameCard, PlayerTime } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameListsService {
    private defaultBestTimes: PlayerTime[];
    constructor() {
        this.defaultBestTimes = [
            { name: 'rxjs', time: 100 },
            { name: 'ts', time: 200 },
            { name: 'angular', time: 250 },
        ];
    }
    buildGameCarrousel(gameCardsList: GameCard[], carrouselGames: GameCarrousel[]): void {
        for (let i = 0; i < gameCardsList.length; i += GAME_CARROUSEL_SIZE) {
            const j = i;
            const gameCarrousel: GameCarrousel = {
                hasNext: i + GAME_CARROUSEL_SIZE < gameCardsList.length,
                hasPrevious: j > 0,
                gameCards: gameCardsList.slice(j, i + GAME_CARROUSEL_SIZE),
            };
            carrouselGames.push(gameCarrousel);
        }
    }

    buildGameCardsList(createdGames: CreateGameDto[]): GameCard[] {
        return createdGames.map((game) => ({
            id: game.id,
            name: game.name,
            difficultyLevel: game.isHard,
            soloTopTime: this.defaultBestTimes,
            oneVsOneTopTime: this.defaultBestTimes,
            thumbnail: game.thumbnail,
        }));
    }
}
