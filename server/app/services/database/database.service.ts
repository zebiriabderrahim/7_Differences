import { Game, GameDocument } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { GameListsManagerService } from '@app/services/game-lists-manager/game-lists-manager.service';
import { DEFAULT_BONUS_TIME, DEFAULT_COUNTDOWN_VALUE, DEFAULT_HINT_PENALTY } from '@common/constants';
import { CarouselPaginator, GameCard, GameConfigConst, ServerSideGame } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { Model } from 'mongoose';

@Injectable()
export class DatabaseService {
    private games: ServerSideGame[] = [];
    private gameCardsList: GameCard[] = [];
    private carouselGames: CarouselPaginator[] = [];

    private defaultConstants: GameConfigConst = {
        countdownTime: DEFAULT_COUNTDOWN_VALUE,
        penaltyTime: DEFAULT_HINT_PENALTY,
        bonusTime: DEFAULT_BONUS_TIME,
    };
    constructor(@InjectModel(Game.name) private readonly gameModel: Model<GameDocument>, private readonly gameListManager: GameListsManagerService) {}

    getGamesCarrousel(): CarouselPaginator[] {
        this.addGameCard();
        return this.carouselGames;
    }

    getGameById(id: string): ServerSideGame {
        return this.games.find((game) => game.id === id);
    }

    getConfigConstants(): GameConfigConst {
        return this.defaultConstants;
    }

    saveFiles(newGame: ServerSideGame): void {
        const dirName = `assets/${newGame.name}`;
        const dataOfOriginalImage = Buffer.from(newGame.original.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        const dataOfModifiedImage = Buffer.from(newGame.modified.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName);
            fs.writeFileSync(`assets/${newGame.name}/original.bmp`, dataOfOriginalImage);
            fs.writeFileSync(`assets/${newGame.name}/modified.bmp`, dataOfModifiedImage);
            fs.writeFileSync(`assets/${newGame.name}/differences.json`, JSON.stringify(newGame.differences));
        }
    }

    async addGame(newGame: CreateGameDto): Promise<void> {
        const game = this.gameListManager.createGameFromGameDto(newGame);
        const newGameInDB: Game = {
            name: newGame.name,
            original: `assets/${newGame.name}/original.bmp`,
            modified: `assets/${newGame.name}/modified.bmp`,
            differences: `assets/${newGame.name}/differences.json`,
            differencesCount: newGame.nDifference,
            isHard: newGame.isHard,
        };
        const gameInDB = new this.gameModel(newGameInDB);
        await gameInDB.save();
        this.saveFiles(game);
    }

    async addGameCard(): Promise<void> {
        await this.gameModel.find().then((games) => {
            this.games = [];
            this.gameCardsList = [];
            this.carouselGames = [];
            games.forEach((game) => {
                const gameSeverSide: ServerSideGame = {
                    // for _id from mongodb
                    // eslint-disable-next-line no-param-reassign, no-underscore-dangle
                    id: game._id.toString(),
                    name: game.name,
                    original: 'data:image/png;base64,'.concat(fs.readFileSync(`assets/${game.name}/original.bmp`, 'base64')),
                    modified: 'data:image/png;base64,'.concat(fs.readFileSync(`assets/${game.name}/modified.bmp`, 'base64')),
                    differences: JSON.parse(fs.readFileSync(`assets/${game.name}/differences.json`, 'utf-8')),
                    differencesCount: game.differencesCount,
                    isHard: game.isHard,
                };
                this.games.push(gameSeverSide);
                const gameCard = this.gameListManager.buildGameCardFromGame(game);
                this.gameListManager.buildGameCarousel(this.gameCardsList, this.carouselGames);
                this.gameCardsList.push(gameCard);
                this.gameListManager.addGameCarousel(gameCard, this.carouselGames);
            });
        });
    }
}
