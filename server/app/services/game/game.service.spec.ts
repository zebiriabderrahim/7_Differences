import { Game } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { DatabaseService } from '@app/services/database/database.service';
import { CarouselPaginator, GameConfigConst } from '@common/game-interfaces';
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
        _id: 'test',
        name: 'test',
        isHard: true,
        originalImage: 'test',
        modifiedImage: 'test',
        nDifference: 1,
        differences: 'test',
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

    it('getConfigConstants() should call getConfigConstants() and return gameConfigConstTest as expected', () => {
        databaseService.getConfigConstants.returns(gameConfigConstTest);
        expect(gameService.getConfigConstants()).toEqual(gameConfigConstTest);
        expect(databaseService.getConfigConstants.calledOnce).toBe(true);
    });

    it('getConfigConstants() should throw NotFoundException when getConfigConstants() in databaseService unable to found GameConfigConst ', () => {
        databaseService.getConfigConstants.returns(undefined);
        expect(() => gameService.getConfigConstants()).toThrowError();
        expect(databaseService.getConfigConstants.calledOnce).toBe(true);
    });
    it('getGamesCarousel() should call getGamesCarousel() and return testCarousel as expected ', async () => {
        databaseService.getGamesCarrousel.resolves(testCarousel);
        expect(await gameService.getGameCarousel()).toEqual(testCarousel);
        expect(databaseService.getGamesCarrousel.calledOnce).toBe(true);
    });

    it('getGamesCarrousel() should throw NotFoundException when getGamesCarrousel() in databaseService unable to found GamesCarrousel ', async () => {
        databaseService.getGamesCarrousel.returns(undefined);
        expect(async () => await gameService.getGameCarousel()).rejects.toThrowError();
        expect(databaseService.getGamesCarrousel.calledOnce).toBe(true);
    });

    it('getGameById() should call with the right arg getGameById() and return testGame as expected', async () => {
        databaseService.getGameById.resolves(testGame);
        expect(await gameService.getGameById('1')).toEqual(testGame);
        expect(databaseService.getGameById.calledOnce).toBe(true);
        expect(databaseService.getGameById.calledWith('1')).toBe(true);
    });

    it('getGameById() should throw HttpException when getGameById() in databaseService unable to found Game', () => {
        databaseService.getGameById.returns(undefined);
        expect(async () => await gameService.getGameById('0')).rejects.toThrowError();
        expect(databaseService.getGameById.calledOnce).toBe(true);
    });

    it('addGame () should call with the fakeGame arg addGame() ', () => {
        const fakeGame = new CreateGameDto();
        gameService.addGame(fakeGame);
        expect(databaseService.addGameInDb.calledOnce).toBe(true);
        expect(databaseService.addGameInDb.calledWith(fakeGame)).toBe(true);
    });

    it('verifyIfGameExists () should call with the right arg verifyIfGameExists() and return true as expected', async () => {
        databaseService.verifyIfGameExists.resolves(true);
        expect(await gameService.verifyIfGameExists('1')).toBe(true);
        expect(databaseService.verifyIfGameExists.calledOnce).toBe(true);
        expect(databaseService.verifyIfGameExists.calledWith('1')).toBe(true);
    });

    it('verifyIfGameExists () should call with the right arg verifyIfGameExists() and return false as expected', async () => {
        databaseService.verifyIfGameExists.resolves(false);
        expect(await gameService.verifyIfGameExists('1')).toBe(false);
        expect(databaseService.verifyIfGameExists.calledOnce).toBe(true);
        expect(databaseService.verifyIfGameExists.calledWith('1')).toBe(true);
    });

    it('deleteGameById () should call with the right arg deleteGameById() ', async () => {
        databaseService.deleteGameById.resolves();
        await gameService.deleteGameById('1');
        expect(databaseService.deleteGameById.calledOnce).toBe(true);
        expect(databaseService.deleteGameById.calledWith('1')).toBe(true);
    });
});
