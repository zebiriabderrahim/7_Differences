import { Game, GameCard, CarrouselPaginator } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { GameListsService } from '@app/services/game-lists/game-lists.service';

@Injectable()
export class DatabaseService {
    private games: Game[] = [];
    private gameCardsList: GameCard[] = [];
    private carrouselGames: CarrouselPaginator[] = [];
    constructor(private gameListService: GameListsService) {}

    getGamesCarrousel(): CarrouselPaginator[] {
        this.gameListService.buildGameCarrousel(this.gameCardsList, this.carrouselGames);
        return this.carrouselGames;
    }

    getGameById(id: string): Game | void {
        return this.games.find((game) => game.id === +id);
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
}
