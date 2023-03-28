// Id comes from database to allow _id
/* eslint-disable no-underscore-dangle */
import { Game, GameDocument } from '@app/model/database/game';
import { GameCard, GameCardDocument } from '@app/model/database/game-card';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { GameListsManagerService } from '@app/services/game-lists-manager/game-lists-manager.service';
import { DEFAULT_BONUS_TIME, DEFAULT_COUNTDOWN_VALUE, DEFAULT_HINT_PENALTY } from '@common/constants';
import { CarouselPaginator, GameConfigConst, GameModes, PlayerTime } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { Model } from 'mongoose';

@Injectable()
export class DatabaseService {
    private defaultConstants: GameConfigConst = {
        countdownTime: DEFAULT_COUNTDOWN_VALUE,
        penaltyTime: DEFAULT_HINT_PENALTY,
        bonusTime: DEFAULT_BONUS_TIME,
    };
    constructor(
        @InjectModel(Game.name) private readonly gameModel: Model<GameDocument>,
        @InjectModel(GameCard.name) private readonly gameCardModel: Model<GameCardDocument>,
        private readonly gameListManager: GameListsManagerService,
    ) {}

    async getGamesCarrousel(): Promise<CarouselPaginator[]> {
        if (this.gameListManager['carouselGames'].length === 0) {
            const gameCardsList: GameCard[] = await this.gameCardModel.find().exec();
            this.gameListManager.buildGameCarousel(gameCardsList);
        }
        return this.gameListManager.getCarouselGames();
    }
    async getTopTimesGameById(gameId: string, gameMode: string): Promise<PlayerTime[]> {
        const mode = gameMode === GameModes.ClassicSolo ? 'soloTopTime' : 'oneVsOneTopTime';
        const topTimes = await this.gameCardModel
            .findById(gameId)
            .sort({ [mode]: -1 })
            .exec();
        return topTimes[mode];
    }
    async getGameById(id: string): Promise<Game> {
        return await this.gameModel.findById(id, '-__v').exec();
    }

    getConfigConstants(): GameConfigConst {
        return this.defaultConstants;
    }

    async verifyIfGameExists(gameName: string): Promise<boolean> {
        return Boolean(await this.gameModel.exists({ name: gameName }));
    }

    saveFiles(newGame: CreateGameDto): void {
        const dirName = `assets/${newGame.name}`;
        const dataOfOriginalImage = Buffer.from(newGame.originalImage.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        const dataOfModifiedImage = Buffer.from(newGame.modifiedImage.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName);
            fs.writeFileSync(`assets/${newGame.name}/original.bmp`, dataOfOriginalImage);
            fs.writeFileSync(`assets/${newGame.name}/modified.bmp`, dataOfModifiedImage);
            fs.writeFileSync(`assets/${newGame.name}/differences.json`, JSON.stringify(newGame.differences));
        }
    }

    async addGameInDb(newGame: CreateGameDto): Promise<void> {
        try {
            const newGameInDB: Game = {
                name: newGame.name,
                originalImage: `assets/${newGame.name}/original.bmp`,
                modifiedImage: `assets/${newGame.name}/modified.bmp`,
                differences: `assets/${newGame.name}/differences.json`,
                nDifference: newGame.nDifference,
                isHard: newGame.isHard,
            };
            this.saveFiles(newGame);
            const id = (await this.gameModel.create(newGameInDB))._id.toString();
            newGameInDB._id = id;
            const gameCard = this.gameListManager.buildGameCardFromGame(newGameInDB);
            await this.gameCardModel.create(gameCard);
            this.gameListManager.addGameCarousel(gameCard);
        } catch (error) {
            return Promise.reject(`Failed to insert game: ${error}`);
        }
    }

    deleteGameAssetsByName(gameName: string): void {
        fs.unlinkSync(`assets/${gameName}/original.bmp`);
        fs.unlinkSync(`assets/${gameName}/modified.bmp`);
        fs.unlinkSync(`assets/${gameName}/differences.json`);
        fs.rmdirSync(`assets/${gameName}/`);
    }

    async deleteGameById(id: string): Promise<void> {
        try {
            await this.gameModel.findByIdAndDelete(id).exec();
            const gameName = (await this.gameCardModel.findByIdAndDelete(id).exec()).name;
            this.deleteGameAssetsByName(gameName);
            await this.rebuildGameCarousel();
        } catch (error) {
            return Promise.reject(`Failed to delete game with id : ${id} --> ${error}`);
        }
    }

    async updateTopTimesGameById(id: string, gameMode: string, topTimes: PlayerTime[]): Promise<void> {
        try {
            const mode = gameMode === GameModes.ClassicSolo ? 'soloTopTime' : 'oneVsOneTopTime';
            await this.gameCardModel.findByIdAndUpdate(id, { [mode]: topTimes }).exec();
            await this.rebuildGameCarousel();
        } catch (error) {
            return Promise.reject(`Failed to update top times game with id : ${id} --> ${error}`);
        }
    }

    async rebuildGameCarousel(): Promise<void> {
        const gameCardsList: GameCard[] = await this.gameCardModel.find().exec();
        this.gameListManager.buildGameCarousel(gameCardsList);
    }
}
