import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { DatabaseService } from '@app/services/database/database.service';
import { DEFAULT_BONUS_TIME, DEFAULT_COUNTDOWN_VALUE, DEFAULT_HINT_PENALTY } from '@common/constants';
import { Game, GameCard, GameConfig, GameDetails, PlayerTime } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameService {
    private gameNames: string[];
    private defaultBestTimes: PlayerTime[];
    private defaultConstants: GameConfig;

    constructor(private readonly databaseService: DatabaseService) {
        this.gameNames = [];

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

    getGameCards(): GameCard[] {
        return this.databaseService.getGameCards();
    }

    getGameById(id: string): Game {
        return this.databaseService.getGameById(id);
    }

    getConfigConstants(): GameConfig {
        return this.defaultConstants;
    }

    addGame(newGame: CreateGameDto): void {
        this.gameNames.push(newGame.name);
        // strip off the data: url prefix to get just the base64-encoded bytes
        this.databaseService.saveFiles(newGame.name, Buffer.from(newGame.originalImagePath.replace(/^data:image\/\w+;base64,/, ''), 'base64'));
        this.databaseService.addGame(this.createGameData(newGame));
    }

    modifyConfigConstants(newConstants: GameConfig): void {
        this.defaultConstants = newConstants;
    }

    createGameData(newGame: GameDetails): Game {
        return {
            id: newGame.id,
            name: newGame.name,
            soloTopTime: this.defaultBestTimes,
            oneVsOneTopTime: this.defaultBestTimes,
            difficultyLevel: newGame.nDifference,
            thumbnail: '',
            differencesCount: newGame.nDifference,
            hintList: [],
        };
    }
}
