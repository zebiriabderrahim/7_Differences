import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { GameListsManagerService } from '@app/services/game-lists-manager/game-lists-manager.service';
import { DEFAULT_BONUS_TIME, DEFAULT_COUNTDOWN_VALUE, DEFAULT_HINT_PENALTY } from '@common/constants';
import { CarouselPaginator, Game, GameCard, GameConfigConst } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class DatabaseService {
    private games: Game[] = [];
    private gameCardsList: GameCard[] = [];
    private carouselGames: CarouselPaginator[] = [];
    private defaultConstants: GameConfigConst = {
        countdownTime: DEFAULT_COUNTDOWN_VALUE,
        penaltyTime: DEFAULT_HINT_PENALTY,
        bonusTime: DEFAULT_BONUS_TIME,
    };
    constructor(private readonly gameListManager: GameListsManagerService) {}
    getGamesCarrousel(): CarouselPaginator[] {
        return this.carouselGames;
    }

    getGameById(id: number): Game {
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
        const game = this.gameListManager.createGameFromGameDto(newGame);
        this.games.push(game);
        this.addGameCard(game);
        this.saveFiles(newGame.name, Buffer.from(newGame.originalImage.replace(/^data:image\/\w+;base64,/, ''), 'base64'));
    }

    addGameCard(game: Game): void {
        const gameCard = this.gameListManager.buildGameCardFromGame(game);
        this.gameListManager.buildGameCarousel(this.gameCardsList, this.carouselGames);
        this.gameCardsList.push(gameCard);
        this.gameListManager.addGameCarousel(gameCard, this.carouselGames);
    }
}
