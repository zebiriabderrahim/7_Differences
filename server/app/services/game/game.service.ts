import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { DatabaseService } from '@app/services/database/database.service';
import { CarrouselPaginator as CarouselPaginator, Game, GameConfigConst } from '@common/game-interfaces';
import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';

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

    getGameById(id: string): Game {
        const game = this.databaseService.getGameById(id);
        if (game) {
            return game;
        }
        throw new HttpException('No games found', HttpStatus.NOT_FOUND);
    }

    addGame(newGame: CreateGameDto): void {
        this.databaseService.addGame(newGame);
    }
}
