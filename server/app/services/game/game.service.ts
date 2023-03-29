import { Game } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { GameConstantsDto } from '@app/model/dto/game/game-constants.dto';
import { DatabaseService } from '@app/services/database/database.service';
import { CarouselPaginator, GameConfigConst, PlayerTime } from '@common/game-interfaces';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class GameService {
    constructor(private readonly databaseService: DatabaseService) {}

    async getGameConstants(): Promise<GameConfigConst> {
        const configConstants = await this.databaseService.getGameConstants();
        if (configConstants) {
            return configConstants;
        }
        throw new NotFoundException('No game config constants found');
    }

    async getGameCarousel(): Promise<CarouselPaginator[]> {
        const gamesCarrousels = await this.databaseService.getGamesCarrousel();
        if (gamesCarrousels) {
            return gamesCarrousels;
        }
        throw new NotFoundException('No gamesCarrousels found');
    }

    async verifyIfGameExists(gameName: string): Promise<boolean> {
        return await this.databaseService.verifyIfGameExists(gameName);
    }

    async getGameById(gameId: string): Promise<Game> {
        const game = this.databaseService.getGameById(gameId);
        if (game) {
            return game;
        }
        throw new NotFoundException('No games found');
    }

    async deleteGameById(gameId: string): Promise<void> {
        await this.databaseService.deleteGameById(gameId);
    }

    async addGame(newGame: CreateGameDto): Promise<void> {
        await this.databaseService.addGameInDb(newGame);
    }

    async getTopTimesGameById(gameId: string, gameMode: string): Promise<PlayerTime[]> {
        const game = await this.databaseService.getTopTimesGameById(gameId, gameMode);
        if (game) {
            return game;
        }
        throw new NotFoundException('No games found');
    }

    async updateTopTimesGameById(gameId: string, gameMode: string, topTimes: PlayerTime[]) {
        await this.databaseService.updateTopTimesGameById(gameId, gameMode, topTimes);
    }

    async updateGameConstants(gameConstantsDto: GameConstantsDto) {
        await this.databaseService.updateGameConstants(gameConstantsDto);
    }

    async resetTopTimesGameById(gameId: string) {
        await this.databaseService.resetTopTimesGameById(gameId);
    }

    async resetAllTopTimes() {
        await this.databaseService.resetAllTopTimes();
    }
}
