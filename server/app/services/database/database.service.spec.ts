import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { GameListsManagerService } from '@app/services/game-lists-manager/game-lists-manager.service';
import { CarouselPaginator, GameCard, GameConfigConst, PlayerTime, ServerSideGame } from '@common/game-interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
    let dataBaseService: DatabaseService;
    let listsManagerService: SinonStubbedInstance<GameListsManagerService>;
    const mockData: Buffer = Buffer.from('');
    const defaultBestTimes: PlayerTime[] = [
        { name: 'John Doe', time: 100 },
        { name: 'Jane Doe', time: 200 },
        { name: 'the scream', time: 250 },
    ];
    const gameConfigConstTest: GameConfigConst = {
        countdownTime: 300,
        penaltyTime: 250,
        bonusTime: 100,
    };
    const testCarousel: CarouselPaginator[] = [
        {
            hasNext: false,
            hasPrevious: false,
            gameCards: [{} as GameCard],
        },
    ];

    const testGames: ServerSideGame[] = [
        {
            id: 1,
            name: 'test',
            isHard: true,
            original: 'test',
            modified: 'test',
            soloTopTime: defaultBestTimes,
            oneVsOneTopTime: defaultBestTimes,
            differencesCount: 1,
            differences: [[]],
            thumbnail: 'test',
        },
    ];

    const testGameDto: CreateGameDto = {
        id: 1,
        name: 'test',
        originalImage: 'test',
        modifiedImage: 'test',
        nDifference: 1,
        differences: [[]],
        isHard: true,
    };

    const testGameCard: GameCard = {
        id: 1,
        name: 'test',
        difficultyLevel: true,
        soloTopTime: defaultBestTimes,
        oneVsOneTopTime: defaultBestTimes,
        thumbnail: 'test',
    };

    beforeEach(async () => {
        listsManagerService = createStubInstance(GameListsManagerService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [DatabaseService, { provide: GameListsManagerService, useValue: listsManagerService }],
        }).compile();

        dataBaseService = module.get<DatabaseService>(DatabaseService);
    });

    it('should be defined', () => {
        expect(dataBaseService).toBeDefined();
    });

    it('getGamesCarrousel() should return the games carrousel as expected', () => {
        dataBaseService['carouselGames'] = testCarousel;
        expect(dataBaseService.getGamesCarrousel()).toEqual(testCarousel);
    });

    it('getGameById() should return the game as expected', () => {
        dataBaseService['games'] = testGames;
        expect(dataBaseService.getGameById(1)).toEqual(testGames.find((game) => game.id === 1));
    });

    it('getConfigConstants() should return the constants as expected', () => {
        dataBaseService['defaultConstants'] = gameConfigConstTest;
        expect(dataBaseService.getConfigConstants()).toEqual(gameConfigConstTest);
    });

    it('should store the game if the game isnt stored yet', async () => {
        const existSpy = jest.spyOn(fs, 'existsSync');
        const mkDirSpy = jest.spyOn(fs, 'mkdirSync');
        const writeSpy = jest.spyOn(fs, 'writeFileSync');

        dataBaseService.saveFiles('mockGameName', mockData);
        expect(existSpy).toBeCalled();
        expect(mkDirSpy).toBeCalled();
        expect(writeSpy).toBeCalledTimes(2);

        jest.clearAllMocks();

        dataBaseService.saveFiles('mockGameName', mockData);
        expect(existSpy).toBeCalled();
        expect(mkDirSpy).not.toBeCalled();
        expect(writeSpy).not.toBeCalled();
    });

    it('addGame() should add the game to the games list and call createGameFromGameDto and addGameCard ', () => {
        listsManagerService.createGameFromGameDto.returns(testGames[0]);
        const addGameCardSpy = jest.spyOn(dataBaseService, 'addGameCard');
        dataBaseService.addGame(testGameDto);
        expect(listsManagerService.createGameFromGameDto.calledOnce).toBe(true);
        expect(addGameCardSpy).toBeCalledTimes(1);
        expect(dataBaseService['games']).toEqual(testGames);
    });

    it('addGameCard() should add the game card to the game card list', () => {
        listsManagerService.buildGameCardFromGame.returns(testGameCard);
        dataBaseService.addGameCard(testGames[0]);
        expect(listsManagerService.buildGameCardFromGame.calledOnce).toBe(true);
        expect(listsManagerService.buildGameCarousel.calledOnce).toBe(true);
        expect(listsManagerService.addGameCarousel.calledOnce).toBe(true);
        expect(dataBaseService['gameCardsList'][0]).toEqual(testGameCard);
    });
});
