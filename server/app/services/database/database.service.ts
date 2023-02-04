import { Game, GameCard, CarouselPaginator, GameConfigConst, PlayerTime } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { DEFAULT_COUNTDOWN_VALUE, DEFAULT_HINT_PENALTY, DEFAULT_BONUS_TIME, GAME_CARROUSEL_SIZE } from '@common/constants';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { GameListsManagerService } from '@app/services/game-lists-manager/game-lists-manager.service';

@Injectable()
export class DatabaseService {
    private games: Game[] = [];
    private gameCardsList: GameCard[] = [];
    private carouselGames: CarouselPaginator[] = [];
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
    }

    addGameCard(game: Game): void {
        const gameCard = this.gameListManager.buildGameCardFromGame(game);
        this.gameCardsList.push(gameCard);
        this.gameListManager.buildGameCarousel(this.gameCardsList, this.carouselGames);
        this.gameListManager.addGameCarousel(gameCard, this.carouselGames);
    }
}
