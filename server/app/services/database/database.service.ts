import { Game, GameCard, GameCarrousel } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class DatabaseService {
    private games: Game[];
    private gameCardsList: GameCard[];
    private carrouselGames: GameCarrousel[];

    constructor() {
        this.games = [
            {
                id: 1,
                name: 'Bouffon',
                difficultyLevel: 1,
                thumbnail: 'test',
                original: '@assets/Bouffon/original.bmp',
                modified: '@assets/Bouffon/modified.bmp',
                soloTopTime: [
                    { name: 'top1', time: 1 },
                    { name: 'top2', time: 2 },
                    { name: 'top3', time: 3 },
                ],
                oneVsOneTopTime: [
                    { name: 'test1', time: 1 },
                    { name: 'test2', time: 2 },
                    { name: 'test3', time: 3 },
                ],
                differencesCount: 10,
                hintList: [],
            },
            {
                id: 1,
                name: 'Bouffon',
                difficultyLevel: 1,
                thumbnail: 'test',
                original: '@assets/Bouffon/original.bmp',
                modified: '@assets/Bouffon/modified.bmp',
                soloTopTime: [
                    { name: 'top1', time: 1 },
                    { name: 'top2', time: 2 },
                    { name: 'top3', time: 3 },
                ],
                oneVsOneTopTime: [
                    { name: 'test1', time: 1 },
                    { name: 'test2', time: 2 },
                    { name: 'test3', time: 3 },
                ],
                differencesCount: 10,
                hintList: [],
            },
            {
                id: 1,
                name: 'Bouffon',
                difficultyLevel: 1,
                thumbnail: 'test',
                original: '@assets/Bouffon/original.bmp',
                modified: '@assets/Bouffon/modified.bmp',
                soloTopTime: [
                    { name: 'top1', time: 1 },
                    { name: 'top2', time: 2 },
                    { name: 'top3', time: 3 },
                ],
                oneVsOneTopTime: [
                    { name: 'test1', time: 1 },
                    { name: 'test2', time: 2 },
                    { name: 'test3', time: 3 },
                ],
                differencesCount: 10,
                hintList: [],
            },
            {
                id: 1,
                name: 'Bouffon',
                difficultyLevel: 1,
                thumbnail: 'test',
                original: '@assets/Bouffon/original.bmp',
                modified: '@assets/Bouffon/modified.bmp',
                soloTopTime: [
                    { name: 'top1', time: 1 },
                    { name: 'top2', time: 2 },
                    { name: 'top3', time: 3 },
                ],
                oneVsOneTopTime: [
                    { name: 'test1', time: 1 },
                    { name: 'test2', time: 2 },
                    { name: 'test3', time: 3 },
                ],
                differencesCount: 10,
                hintList: [],
            },
            {
                id: 1,
                name: 'Bouffon',
                difficultyLevel: 1,
                thumbnail: 'test',
                original: '@assets/Bouffon/original.bmp',
                modified: '@assets/Bouffon/modified.bmp',
                soloTopTime: [
                    { name: 'top1', time: 1 },
                    { name: 'top2', time: 2 },
                    { name: 'top3', time: 3 },
                ],
                oneVsOneTopTime: [
                    { name: 'test1', time: 1 },
                    { name: 'test2', time: 2 },
                    { name: 'test3', time: 3 },
                ],
                differencesCount: 10,
                hintList: [],
            },
            {
                id: 1,
                name: 'Bouffon',
                difficultyLevel: 1,
                thumbnail: 'test',
                original: '@assets/Bouffon/original.bmp',
                modified: '@assets/Bouffon/modified.bmp',
                soloTopTime: [
                    { name: 'top1', time: 1 },
                    { name: 'top2', time: 2 },
                    { name: 'top3', time: 3 },
                ],
                oneVsOneTopTime: [
                    { name: 'test1', time: 1 },
                    { name: 'test2', time: 2 },
                    { name: 'test3', time: 3 },
                ],
                differencesCount: 10,
                hintList: [],
            },
            {
                id: 1,
                name: 'Bouffon',
                difficultyLevel: 1,
                thumbnail: 'test',
                original: '@assets/Bouffon/original.bmp',
                modified: '@assets/Bouffon/modified.bmp',
                soloTopTime: [
                    { name: 'top1', time: 1 },
                    { name: 'top2', time: 2 },
                    { name: 'top3', time: 3 },
                ],
                oneVsOneTopTime: [
                    { name: 'test1', time: 1 },
                    { name: 'test2', time: 2 },
                    { name: 'test3', time: 3 },
                ],
                differencesCount: 10,
                hintList: [],
            },
            {
                id: 1,
                name: 'Bouffon',
                difficultyLevel: 1,
                thumbnail: 'test',
                original: '@assets/Bouffon/original.bmp',
                modified: '@assets/Bouffon/modified.bmp',
                soloTopTime: [
                    { name: 'top1', time: 1 },
                    { name: 'top2', time: 2 },
                    { name: 'top3', time: 3 },
                ],
                oneVsOneTopTime: [
                    { name: 'test1', time: 1 },
                    { name: 'test2', time: 2 },
                    { name: 'test3', time: 3 },
                ],
                differencesCount: 10,
                hintList: [],
            },
            {
                id: 1,
                name: 'Bouffon',
                difficultyLevel: 1,
                thumbnail: 'test',
                original: '@assets/Bouffon/original.bmp',
                modified: '@assets/Bouffon/modified.bmp',
                soloTopTime: [
                    { name: 'top1', time: 1 },
                    { name: 'top2', time: 2 },
                    { name: 'top3', time: 3 },
                ],
                oneVsOneTopTime: [
                    { name: 'test1', time: 1 },
                    { name: 'test2', time: 2 },
                    { name: 'test3', time: 3 },
                ],
                differencesCount: 10,
                hintList: [],
            },
            {
                id: 1,
                name: 'Bouffon',
                difficultyLevel: 1,
                thumbnail: 'test',
                original: '@assets/Bouffon/original.bmp',
                modified: '@assets/Bouffon/modified.bmp',
                soloTopTime: [
                    { name: 'top1', time: 1 },
                    { name: 'top2', time: 2 },
                    { name: 'top3', time: 3 },
                ],
                oneVsOneTopTime: [
                    { name: 'test1', time: 1 },
                    { name: 'test2', time: 2 },
                    { name: 'test3', time: 3 },
                ],
                differencesCount: 10,
                hintList: [],
            },
            {
                id: 1,
                name: 'Bouffon',
                difficultyLevel: 1,
                thumbnail: 'test',
                original: '@assets/Bouffon/original.bmp',
                modified: '@assets/Bouffon/modified.bmp',
                soloTopTime: [
                    { name: 'top1', time: 1 },
                    { name: 'top2', time: 2 },
                    { name: 'top3', time: 3 },
                ],
                oneVsOneTopTime: [
                    { name: 'test1', time: 1 },
                    { name: 'test2', time: 2 },
                    { name: 'test3', time: 3 },
                ],
                differencesCount: 10,
                hintList: [],
            },
            {
                id: 1,
                name: 'Bouffon',
                difficultyLevel: 1,
                thumbnail: 'test',
                original: '@assets/Bouffon/original.bmp',
                modified: '@assets/Bouffon/modified.bmp',
                soloTopTime: [
                    { name: 'top1', time: 1 },
                    { name: 'top2', time: 2 },
                    { name: 'top3', time: 3 },
                ],
                oneVsOneTopTime: [
                    { name: 'test1', time: 1 },
                    { name: 'test2', time: 2 },
                    { name: 'test3', time: 3 },
                ],
                differencesCount: 10,
                hintList: [],
            },
            {
                id: 1,
                name: 'Bouffon',
                difficultyLevel: 1,
                thumbnail: 'test',
                original: '@assets/Bouffon/original.bmp',
                modified: '@assets/Bouffon/modified.bmp',
                soloTopTime: [
                    { name: 'top1', time: 1 },
                    { name: 'top2', time: 2 },
                    { name: 'top3', time: 3 },
                ],
                oneVsOneTopTime: [
                    { name: 'test1', time: 1 },
                    { name: 'test2', time: 2 },
                    { name: 'test3', time: 3 },
                ],
                differencesCount: 10,
                hintList: [],
            },
            {
                id: 1,
                name: 'Bouffon',
                difficultyLevel: 1,
                thumbnail: 'test',
                original: '@assets/Bouffon/original.bmp',
                modified: '@assets/Bouffon/modified.bmp',
                soloTopTime: [
                    { name: 'top1', time: 1 },
                    { name: 'top2', time: 2 },
                    { name: 'top3', time: 3 },
                ],
                oneVsOneTopTime: [
                    { name: 'test1', time: 1 },
                    { name: 'test2', time: 2 },
                    { name: 'test3', time: 3 },
                ],
                differencesCount: 10,
                hintList: [],
            },
        ];
        this.gameCardsList = [];
        this.carrouselGames = [];
    }

    getGamesData(): Game[] {
        return this.games;
    }

    async getGames(): Promise<GameCarrousel[]> {
        for (const game of this.games) {
            this.gameCardsList.push({
                id: game.id,
                name: game.name,
                difficultyLevel: game.difficultyLevel,
                soloTopTime: game.soloTopTime,
                oneVsOneTopTime: game.oneVsOneTopTime,
                thumbnail: game.thumbnail,
            });
        }
        this.carrouselGames = this.buildGameCarrousel();

        return this.carrouselGames;
    }

    async getGameById(id: string): Promise<Game | void> {
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
    }

    buildGameCarrousel(): GameCarrousel[] {
        let j = 0;
        const gamePhase = 4;
        for (let i = 0; i < this.gameCardsList.length; ) {
            i += gamePhase;
            const gameCarrousel: GameCarrousel = {
                hasNext: this.gameCardsList.length - (j + gamePhase) > 0,
                hasPrevious: j > 0,
                gameCards: this.gameCardsList.slice(j, i),
            };
            j = i;
            this.carrouselGames.push(gameCarrousel);
        }
        return this.carrouselGames;
    }
}
