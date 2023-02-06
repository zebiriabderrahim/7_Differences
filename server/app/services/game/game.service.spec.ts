import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { DatabaseService } from '@app/services/database/database.service';
import { CarouselPaginator, Game, GameConfigConst } from '@common/game-interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { GameService } from './game.service';

describe('GameService', () => {
    let gameService: GameService;
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

        gameService = module.get<GameService>(GameService);
    });

    it('should be defined', () => {
        expect(gameService).toBeDefined();
    });

    it('should call getConfigConstants() and return gameConfigConstTest as expected', () => {
        databaseService.getConfigConstants.returns(gameConfigConstTest);
        expect(gameService.getConfigConstants()).toEqual(gameConfigConstTest);
        expect(databaseService.getConfigConstants.calledOnce).toBeTruthy();
    });

    it('should throw NotFoundException when getConfigConstants() in databaseService unable to found GameConfigConst ', () => {
        databaseService.getConfigConstants.returns(undefined);
        expect(() => gameService.getConfigConstants()).toThrowError();
        expect(databaseService.getConfigConstants.calledOnce).toBeTruthy();
    });
    it('should call getGamesCarousel() and return testCarousel as expected ', () => {
        databaseService.getGamesCarrousel.returns(testCarousel);
        expect(gameService.getGameCarousel()).toEqual(testCarousel);
        expect(databaseService.getGamesCarrousel.calledOnce).toBeTruthy();
    });

    it('should call with the right arg getGameById() and return testGame as expected', () => {
        databaseService.getGameById.returns(testGame);
        expect(gameService.getGameById(1)).toEqual(testGame);
        expect(databaseService.getGameById.calledOnce).toBeTruthy();
        expect(databaseService.getGameById.calledWith(1)).toBeTruthy();
    });

    it('should throw HttpException when getGameById() in databaseService unable to found Game', () => {
        databaseService.getGameById.returns(undefined);
        expect(() => gameService.getGameById(0)).toThrowError();
        expect(databaseService.getGameById.calledOnce).toBeTruthy();
    });

    it('should call with the fakeGame arg addGame() ', () => {
        const fakeGame = new CreateGameDto();
        gameService.addGame(fakeGame);
        expect(databaseService.addGame.calledOnce).toBeTruthy();
        expect(databaseService.addGame.calledWith(fakeGame)).toBeTruthy();
    });
});
