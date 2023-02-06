import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { DatabaseService } from '@app/services/database/database.service';
import { CarouselPaginator, GameConfigConst, ServerSideGame } from '@common/game-interfaces';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class GameService {
    constructor(private readonly databaseService: DatabaseService) {}

    getConfigConstants(): GameConfigConst {
        const configConstants = this.databaseService.getConfigConstants();
        if (configConstants) {
            return configConstants;
        }
        throw new NotFoundException('No game config constants found');
    }

    getGameCarousel(): CarouselPaginator[] {
        return this.databaseService.getGamesCarrousel();
    }

    getGameById(id: number): ServerSideGame {
        const game = this.databaseService.getGameById(id);
        if (game) {
            return game;
        }
        throw new NotFoundException('No games found');
    }

    addGame(newGame: CreateGameDto): void {
        this.databaseService.addGame(newGame);
    }
}
