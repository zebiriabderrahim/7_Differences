import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '@app/services/database/database.service';
import { GameService } from './game.service';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Game, GameConfigConst, CarouselPaginator } from '@common/game-interfaces';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';

describe('GameService', () => {
    let service: GameService;
    let databaseService: SinonStubbedInstance<DatabaseService>;
    const gameConfigConstTest: GameConfigConst = {
        countdownTime: 300,
        penaltyTime: 250,
        bonusTime: 100,
    };
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
        soloTopTime: [],
        oneVsOneTopTime: [],
        differencesCount: 1,
        thumbnail: 'test',
        hintList: [],
    };
    beforeEach(async () => {
        databaseService = createStubInstance(DatabaseService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameService, { provide: DatabaseService, useValue: databaseService }],
        }).compile();

        service = module.get<GameService>(GameService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should call getConfigConstants() and return gameConfigConstTest as expected', () => {
        databaseService.getConfigConstants.returns(gameConfigConstTest);
        expect(service.getConfigConstants()).toEqual(gameConfigConstTest);
        expect(databaseService.getConfigConstants.calledOnce).toBe(true);
    });

    it('should throw NotFoundException when getConfigConstants() in databaseService unable to found GameConfigConst ', () => {
        databaseService.getConfigConstants.returns(undefined);
        expect(() => service.getConfigConstants()).toThrowError();
        expect(databaseService.getConfigConstants.calledOnce).toBe(true);
    });
    it('should call getGamesCarousel() and return testCarousel as expected ', () => {
        databaseService.getGamesCarrousel.returns(testCarousel);
        expect(service.getGameCarousel()).toEqual(testCarousel);
        expect(databaseService.getGamesCarrousel.calledOnce).toBe(true);
    });

    it('should call with the right arg getGameById() and return testGame as expected', () => {
        databaseService.getGameById.returns(testGame);
        expect(service.getGameById(1)).toEqual(testGame);
        expect(databaseService.getGameById.calledOnce).toBe(true);
        expect(databaseService.getGameById.calledWith(1)).toBe(true);
    });

    it('should throw HttpException when getGameById() in databaseService unable to found Game', () => {
        databaseService.getGameById.returns(undefined);
        expect(() => service.getGameById(0)).toThrowError();
        expect(databaseService.getGameById.calledOnce).toBe(true);
    });

    it('should call with the fakeGame arg addGame() ', () => {
        const fakeGame = new CreateGameDto();
        service.addGame(fakeGame);
        expect(databaseService.addGame.calledOnce).toBe(true);
        expect(databaseService.addGame.calledWith(fakeGame)).toBe(true);
    });
});
