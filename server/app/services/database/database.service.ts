import { Game, GameCard, CarrouselPaginator, GameConfigConst } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { DEFAULT_COUNTDOWN_VALUE, DEFAULT_HINT_PENALTY, DEFAULT_BONUS_TIME, GAME_CARROUSEL_SIZE } from '@common/constants';

@Injectable()
export class DatabaseService {
    private games: Game[] = [];
    private gameCardsList: GameCard[] = [];
    private carrouselGames: CarrouselPaginator[] = [];
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

    addGame(gameData: Game): void {
        this.games.push(gameData);
        this.addGameCard(gameData);
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
}
