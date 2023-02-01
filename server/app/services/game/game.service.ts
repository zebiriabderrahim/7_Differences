import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { DatabaseService } from '@app/services/database/database.service';
import { DEFAULT_BONUS_TIME, DEFAULT_COUNTDOWN_VALUE, DEFAULT_HINT_PENALTY } from '@common/constants';
import { CarrouselPaginator, Game, GameConfigConst, PlayerTime } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameService {
    private defaultBestTimes: PlayerTime[];
    private defaultConstants: GameConfigConst;

    constructor(private readonly databaseService: DatabaseService) {
        this.defaultConstants = {
            countdownTime: DEFAULT_COUNTDOWN_VALUE,
            penaltyTime: DEFAULT_HINT_PENALTY,
            bonusTime: DEFAULT_BONUS_TIME,
        };

        this.defaultBestTimes = [
            { name: 'John Doe', time: 100 },
            { name: 'Jane Doe', time: 200 },
            { name: 'the scream', time: 250 },
        ];
    }

    modifyConstants(newConstants: GameConfigConst): void {
        this.defaultConstants = newConstants;
    }

    getConfigConstants(): GameConfigConst {
        return this.defaultConstants;
    }

    getGameCarrousel(): CarrouselPaginator[] {
        return this.databaseService.getGamesCarrousel();
    }

    getGameById(id: string): Game | void {
        return this.databaseService.getGameById(id);
    }

    addGame(newGame: CreateGameDto): void {
        // strip off the data: url prefix to get just the base64-encoded bytes
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
