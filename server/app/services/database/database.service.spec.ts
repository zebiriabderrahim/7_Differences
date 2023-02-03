import { PlayerTime, GameConfigConst, CarouselPaginator, Game, GameCard } from '@common/game-interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import * as fs from 'fs';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';

describe('DatabaseService', () => {
    let dataBaseService: DatabaseService;
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

    const testGames: Game[] = [
        {
            id: 1,
            name: 'test',
            difficultyLevel: true,
            original: 'test',
            modified: 'test',
            soloTopTime: defaultBestTimes,
            oneVsOneTopTime: defaultBestTimes,
            differencesCount: 1,
            thumbnail: 'test',
            hintList: [],
        },
    ];

    const testGameDto: CreateGameDto = {
        id: 1,
        name: 'test',
        originalImagePath: 'test',
        modifiedImagePath: 'test',
        nDifference: 1,
        differenceMatrix: [[]],
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
        const module: TestingModule = await Test.createTestingModule({
            providers: [DatabaseService],
        }).compile();

        dataBaseService = module.get<DatabaseService>(DatabaseService);
    });

    it('should be defined', () => {
        expect(dataBaseService).toBeDefined();
    });

    it('getGamesCarrousel() should call buildGameCarrousel()', () => {
        const buildGameCarrouselSpy = jest.spyOn(dataBaseService, 'buildGameCarrousel');
        dataBaseService.getGamesCarrousel();
        expect(buildGameCarrouselSpy).toBeCalled();
    });
    it('getGamesCarrousel() should return the carrousel as expected', () => {
        dataBaseService['gameCardsList'] = [{} as GameCard];
        dataBaseService.buildGameCarrousel();
        const games = dataBaseService.getGamesCarrousel();
        expect(games).toEqual(testCarousel);
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

    it('addGame() should add the game to the games list', () => {
        const createGameFromGameDtoSpy = jest.spyOn(dataBaseService, 'createGameFromGameDto').mockReturnValue(testGames[0]);
        const addGameCardSpy = jest.spyOn(dataBaseService, 'addGameCard');
        dataBaseService.addGame(testGameDto);
        expect(createGameFromGameDtoSpy).toBeCalledTimes(1);
        expect(addGameCardSpy).toBeCalledTimes(1);
        expect(dataBaseService['games']).toEqual(testGames);
    });

    it('addGameCard() should add the game card to the game card list', () => {
        dataBaseService.addGameCard(testGames[0]);
        expect(dataBaseService['gameCardsList'][0]).toEqual(testGameCard);
    });

    it('buildGameCarrousel() should build the game carrousel', () => {
        const testCarousel2: CarouselPaginator[] = [
            {
                hasNext: true,
                hasPrevious: false,
                gameCards: [{}, {}, {}, {}] as GameCard[],
            },
            {
                hasNext: false,
                hasPrevious: true,
                gameCards: [{}] as GameCard[],
            },
        ];
        dataBaseService['gameCardsList'] = [{}, {}, {}, {}, {}] as GameCard[];
        const carousel = dataBaseService.getGamesCarrousel();
        expect(carousel).toEqual(testCarousel2);
    });

    it('createGameFromGameDto() should create the game from the game dto', () => {
        expect(dataBaseService.createGameFromGameDto(testGameDto)).toEqual(testGames[0]);
    });
});
