import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { CarouselPaginator, Game, GameCard, PlayerTime } from '@common/game-interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { GameListsManagerService } from './game-lists-manager.service';

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
    };
    const testGameCard: GameCard = {
        id: 1,
        name: 'test',
        difficultyLevel: true,
        soloTopTime: defaultBestTimes,
        oneVsOneTopTime: defaultBestTimes,
        thumbnail: 'test',
    };
    const testGameDto: CreateGameDto = {
        id: 1,
        name: 'test',
        originalImagePath: 'test',
        modifiedImagePath: 'test',
        nDifference: 1,
        differenceMatrix: [[]],
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
        const testGameCardFromGame = service.buildGameCardFromGame(testGame);
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

        expect(service.createGameFromGameDto(testGameDto)).toEqual(testGame);
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
        service.buildGameCarousel([], [] as CarouselPaginator[]);
        const addGameCarouselSpy = jest.spyOn(service, 'addGameCarousel');
        expect(testCarousel).toEqual(testCarousel2);
    });
});
