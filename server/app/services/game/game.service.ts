import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { DatabaseService } from '@app/services/database/database.service';
import { CarrouselPaginator as CarouselPaginator, Game, GameConfigConst, PlayerTime } from '@common/game-interfaces';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class GameService {
    private defaultBestTimes: PlayerTime[];

    constructor(private readonly databaseService: DatabaseService) {
        this.defaultBestTimes = [
            { name: 'John Doe', time: 100 },
            { name: 'Jane Doe', time: 200 },
            { name: 'the scream', time: 250 },
        ];
    }

    getConfigConstants(): GameConfigConst {
        const configConstants = this.databaseService.getConfigConstants();
        if (configConstants) {
            return configConstants;
        }
        throw new HttpException('No game config constants found', HttpStatus.NOT_FOUND);
    }

    getGameCarousel(): CarouselPaginator[] {
        return this.databaseService.getGamesCarrousel();
    }

    getGameById(id: string): Game | void {
        const game = this.databaseService.getGameById(id);
        if (game) {
            return game;
        }
        throw new HttpException('No games found', HttpStatus.NOT_FOUND);
    }

    addGame(newGame: CreateGameDto): void {
        this.databaseService.saveFiles(newGame.name, Buffer.from(newGame.originalImagePath.replace(/^data:image\/\w+;base64,/, ''), 'base64'));
        this.databaseService.addGame(this.createGameData(newGame));
    }

    createGameData(newGame: CreateGameDto): Game {
        return {
            id: newGame.id,
            name: newGame.name,
            original: newGame.originalImagePath,
            modified: newGame.modifiedImagePath,
            soloTopTime: this.defaultBestTimes,
            oneVsOneTopTime: this.defaultBestTimes,
            difficultyLevel: newGame.isHard,
            thumbnail: newGame.originalImagePath,
            differencesCount: newGame.nDifference,
            hintList: [],
        };
    }
}
