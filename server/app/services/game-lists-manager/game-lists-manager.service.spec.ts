import { Game } from '@app/model/database/game';
import { CarouselPaginator, GameCard, PlayerTime } from '@common/game-interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import { GameListsManagerService } from './game-lists-manager.service';

describe('GameListsManagerService', () => {
    let service: GameListsManagerService;

    const defaultBestTimes: PlayerTime[] = [
        { name: 'John Doe', time: 100 },
        { name: 'Jane Doe', time: 200 },
        { name: 'the scream', time: 250 },
    ];
    const testGame: Game = {
        _id: '1',
        name: 'test',
        isHard: true,
        originalImage: 'test',
        modifiedImage: 'test',
        nDifference: 1,
        differences: 'test',
    };
    const testGameCard: GameCard = {
        _id: '1',
        name: 'test',
        difficultyLevel: true,
        soloTopTime: defaultBestTimes,
        oneVsOneTopTime: defaultBestTimes,
        thumbnail: '',
    };
    const testCarousel: CarouselPaginator[] = [
        {
            hasNext: true,
            hasPrevious: true,
            gameCards: [testGameCard],
        },
    ];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameListsManagerService],
        }).compile();

        service = module.get<GameListsManagerService>(GameListsManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('addGameCarousel() should call readFileSync()', () => {
        service['carouselGames'] = testCarousel;
        const readFileSyncSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue('test');
        service.addGameCarousel(testGameCard);
        expect(readFileSyncSpy).toBeCalled();
        expect(service['carouselGames']).toEqual(testCarousel);
    });

    it('buildGameCardFromGame() should create the game from the game dto', () => {
        const testGameCard1: GameCard = {
            _id: '1',
            name: 'test',
            difficultyLevel: true,
            soloTopTime: defaultBestTimes,
            oneVsOneTopTime: defaultBestTimes,
            thumbnail: 'assets/test/original.bmp',
        };
        const gameCard = service.buildGameCardFromGame(testGame);
        expect(gameCard).toEqual(testGameCard1);
    });
    it('buildGameCarrousel() should build the game carrousel when it is empty', () => {
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
        service.buildGameCarousel(testGameCards);
        expect(addGameCarouselSpy).toBeCalled();
        expect(service['carouselGames']).toEqual(testCarouselExpected);
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
        service.buildGameCarousel([]);
        expect(addGameCarouselSpy).not.toBeCalled();
        expect(testCarouselBefore).toEqual(testCarousel2);
    });

    it('getGameCarousel() should return the game carousel', () => {
        service['carouselGames'] = testCarousel;
        expect(service.getCarouselGames()).toEqual(testCarousel);
    });
});
