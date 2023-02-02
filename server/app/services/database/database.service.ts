import { Game, GameCard, CarrouselPaginator, GameConfigConst, PlayerTime } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { DEFAULT_COUNTDOWN_VALUE, DEFAULT_HINT_PENALTY, DEFAULT_BONUS_TIME, GAME_CARROUSEL_SIZE } from '@common/constants';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';

@Injectable()
export class DatabaseService {
    private games: Game[] = [];
    private gameCardsList: GameCard[] = [];
    private carrouselGames: CarrouselPaginator[] = [];
    private defaultBestTimes: PlayerTime[] = [
        { name: 'John Doe', time: 100 },
        { name: 'Jane Doe', time: 200 },
        { name: 'the scream', time: 250 },
    ];
    private defaultConstants: GameConfigConst = {
        countdownTime: DEFAULT_COUNTDOWN_VALUE,
        penaltyTime: DEFAULT_HINT_PENALTY,
        bonusTime: DEFAULT_BONUS_TIME,
    };

    getGamesCarrousel(): CarrouselPaginator[] {
        this.carrouselGames = [];
        this.buildGameCarrousel();
        return this.carrouselGames;
    }

    getGameById(id: string): Game | void {
        return this.games.find((game) => game.id === +id);
    }

    getConfigConstants(): GameConfigConst {
        return this.defaultConstants;
    }

    saveFiles(gameName: string, data: Buffer): void {
        const dirName = `assets/${gameName}`;

        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName);
            fs.writeFileSync(`assets/${gameName}/original.bmp`, data);
            fs.writeFileSync(`assets/${gameName}/modified.bmp`, data);
        }
    }

    addGame(newGame: CreateGameDto): void {
        const game: Game = this.createGameFromGameDto(newGame);
        this.saveFiles(newGame.name, Buffer.from(newGame.originalImagePath.replace(/^data:image\/\w+;base64,/, ''), 'base64'));
        this.games.push(game);
        this.addGameCard(game);
    }

    addGameCard(game: Game): void {
        const gameCard: GameCard = {
            id: game.id,
            name: game.name,
            difficultyLevel: game.difficultyLevel,
            soloTopTime: game.soloTopTime,
            oneVsOneTopTime: game.oneVsOneTopTime,
            thumbnail: game.thumbnail,
        };
        this.gameCardsList.push(gameCard);
    }

    buildGameCarrousel(): void {
        for (let i = 0; i < this.gameCardsList.length; i += GAME_CARROUSEL_SIZE) {
            const j = i;
            const gameCarrousel: CarrouselPaginator = {
                hasNext: i + GAME_CARROUSEL_SIZE < this.gameCardsList.length,
                hasPrevious: j > 0,
                gameCards: this.gameCardsList.slice(j, i + GAME_CARROUSEL_SIZE),
            };
            this.carrouselGames.push(gameCarrousel);
        }
    }
    createGameFromGameDto(newGame: CreateGameDto): Game {
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
