import { Game } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { CarouselPaginator, GameCard, PlayerTime, ServerSideGame } from '@common/game-interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { GameListsManagerService } from './game-lists-manager.service';
import * as fs from 'fs';

describe('GameListsManagerService', () => {
    let service: GameListsManagerService;

    const defaultBestTimes: PlayerTime[] = [
        { name: 'John Doe', time: 100 },
        { name: 'Jane Doe', time: 200 },
        { name: 'the scream', time: 250 },
    ];
    const testCarousel: CarouselPaginator[] = [
        {
            hasNext: true,
            hasPrevious: true,
            gameCards: [],
        },
    ];

    const testGame: Game = {
        _id: '1',
        name: 'test',
        isHard: true,
        original: 'test',
        modified: 'test',
        differencesCount: 1,
        differences: 'test',
    };
    const testGames: ServerSideGame[] = [
        {
            id: '',
            name: 'test',
            isHard: true,
            original: 'test',
            modified: 'test',
            differencesCount: 1,
            differences: [[]],
        },
    ];
    const testGameCard: GameCard = {
        id: '1',
        name: 'test',
        difficultyLevel: true,
        soloTopTime: defaultBestTimes,
        oneVsOneTopTime: defaultBestTimes,
        thumbnail: 'test',
    };
    const testGameDto: CreateGameDto = {
        name: 'test',
        originalImage: 'test',
        modifiedImage: 'test',
        nDifference: 1,
        differences: [[]],
        isHard: true,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameListsManagerService],
        }).compile();

        service = module.get<GameListsManagerService>(GameListsManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('buildGameCardFromGame() should call buildGameCarrousel()', () => {
        const readFileSyncSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue('test');
        const testGameCardFromGame = service.buildGameCardFromGame(testGame);
        expect(readFileSyncSpy).toBeCalled();
        expect(testGameCardFromGame).toEqual(testGameCard);
    });
    it('getGamesCarrousel() should return the carrousel as expected', () => {
        const testCarousel2: CarouselPaginator[] = [
            {
                hasNext: true,
                hasPrevious: true,
                gameCards: [testGameCard],
            },
        ];
        service.addGameCarousel(testGameCard, testCarousel);
        expect(testCarousel).toEqual(testCarousel2);
    });
    it('createGameFromGameDto() should create the game from the game dto', () => {
        expect(service.createGameFromGameDto(testGameDto)).toEqual(testGames[0]);
    });
    it('buildGameCarrousel() should build the game carrousel when it is empty', () => {
        const testCarousel2: CarouselPaginator[] = [];
        const testCarouselExpected: CarouselPaginator[] = [
            {
                hasNext: true,
                hasPrevious: false,
                gameCards: [testGameCard, testGameCard, testGameCard, testGameCard],
            },
            {
                hasNext: false,
                hasPrevious: true,
                gameCards: [testGameCard, testGameCard],
            },
        ];
        const testGameCards: GameCard[] = [testGameCard, testGameCard, testGameCard, testGameCard, testGameCard, testGameCard];
        const addGameCarouselSpy = jest.spyOn(service, 'addGameCarousel');
        service.buildGameCarousel(testGameCards, testCarousel2);
        expect(addGameCarouselSpy).toBeCalled();
        expect(testCarouselExpected).toEqual(testCarousel2);
    });
    it('buildGameCarrousel() should not build the game carrousel when it is filled with at least one carousel paginator', () => {
        const testCarousel2: CarouselPaginator[] = [
            {
                hasNext: false,
                hasPrevious: false,
                gameCards: [testGameCard],
            },
        ];
        const testCarouselBefore: CarouselPaginator[] = testCarousel2;
        const addGameCarouselSpy = jest.spyOn(service, 'addGameCarousel');
        service.buildGameCarousel([], testCarousel2);
        expect(addGameCarouselSpy).not.toBeCalled();
        expect(testCarouselBefore).toEqual(testCarousel2);
    });
});
