import { Game, GameCard } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class DatabaseService {
    private games: Game[];
    private selectionViewGames: GameCard[];

    constructor() {
        this.games = [
            {
                id: 1,
                name: 'nicolay',
                difficultyLevel: 1,
                thumbnail: 'test',
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
                id: 2,
                name: 'tVSz',
                difficultyLevel: 1,
                thumbnail: 'test',
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
                id: 3,
                name: 'chat',
                difficultyLevel: 1,
                thumbnail: 'test',
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
                id: 4,
                name: 'rat',
                difficultyLevel: 1,
                thumbnail: 'test',
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
                id: 5,
                name: 'est',
                difficultyLevel: 1,
                thumbnail: 'test',
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
                id: 6,
                name: 'raton',
                difficultyLevel: 1,
                thumbnail: 'test',
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
                id: 7,
                name: 'raton-laveur',
                difficultyLevel: 1,
                thumbnail: 'test',
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
                id: 8,
                name: 'lavons',
                difficultyLevel: 1,
                thumbnail: 'test',
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
                id: 9,
                name: 'génial',
                difficultyLevel: 1,
                thumbnail: 'test',
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
                id: 10,
                name: 'raton',
                difficultyLevel: 1,
                thumbnail: 'test',
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
        this.selectionViewGames = [];
    }

    getGamesData(): Game[] {
        return this.games;
    }

    async getGames(): Promise<GameCard[]> {
        this.selectionViewGames = [];
        for (const game of this.games) {
            this.selectionViewGames.push({
                id: game.id,
                name: game.name,
                difficultyLevel: game.difficultyLevel,
                soloTopTime: game.soloTopTime,
                oneVsOneTopTime: game.oneVsOneTopTime,
                thumbnail: game.thumbnail,
            });
        }
        return this.selectionViewGames;
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
}
