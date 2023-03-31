import { Game } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { GameConstantsDto } from '@app/model/dto/game/game-constants.dto';
import { DatabaseService } from '@app/services/database/database.service';
import { GameModes } from '@common/enums';
import { CarouselPaginator, PlayerTime } from '@common/game-interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { GameService } from './game.service';

describe('GameService', () => {
    let gameService: GameService;
    let databaseService: SinonStubbedInstance<DatabaseService>;

    const defaultBestTimes: PlayerTime[] = [
        { name: 'John Doe', time: 100 },
        { name: 'Jane Doe', time: 200 },
        { name: 'the scream', time: 250 },
    ];

    const gameConfigConstTest: GameConstantsDto = {
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

    it('getGameConstants() should call getConfigConstants() and return GameConstants as expected', async () => {
        databaseService.getGameConstants.resolves(gameConfigConstTest);
        expect(await gameService.getGameConstants()).toEqual(gameConfigConstTest);
        expect(databaseService.getGameConstants.calledOnce).toBe(true);
    });

    it('getGameConstants() should throw NotFoundException when getGameConstants() in databaseService unable to found GameConfigConst ', async () => {
        databaseService.getGameConstants.resolves(undefined);
        expect(databaseService.getGameConstants.calledOnce).toBe(false);
        expect(async () => await gameService.getGameConstants()).rejects.toThrowError();
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

    it('getTopTimesGameById () should call with the right arg getTopTimesGameById() and return testGame as expected', async () => {
        databaseService.getTopTimesGameById.resolves(defaultBestTimes);
        expect(await gameService.getTopTimesGameById('1', GameModes.ClassicOneVsOne)).toEqual(defaultBestTimes);
        expect(databaseService.getTopTimesGameById.calledOnce).toBe(true);
        expect(databaseService.getTopTimesGameById.calledWith('1')).toBe(true);
    });

    it('getTopTimesGameById () should throw HttpException when getTopTimesGameById() in databaseService unable to found Game', async () => {
        databaseService.getTopTimesGameById.resolves(undefined);
        expect(async () => await gameService.getTopTimesGameById('0', GameModes.ClassicOneVsOne)).rejects.toThrowError();
        expect(databaseService.getTopTimesGameById.calledOnce).toBe(true);
    });

    it('updateTopTimesGameById () should call with the right arg updateTopTimesGameById() ', async () => {
        databaseService.updateTopTimesGameById.resolves();
        await gameService.updateTopTimesGameById('1', GameModes.ClassicOneVsOne, [{} as PlayerTime]);
        expect(databaseService.updateTopTimesGameById.calledOnce).toBe(true);
        expect(databaseService.updateTopTimesGameById.calledWith('1', GameModes.ClassicOneVsOne, [{} as PlayerTime])).toBe(true);
    });

    it('updateGameConstants () should call with the right arg updateGameConstants() ', async () => {
        databaseService.updateGameConstants.resolves();
        await gameService.updateGameConstants(gameConfigConstTest);
        expect(databaseService.updateGameConstants.calledOnce).toBe(true);
        expect(databaseService.updateGameConstants.calledWith(gameConfigConstTest)).toBe(true);
    });

    it('resetTopTimesGameById () should call with the right arg resetTopTimesGameById() ', async () => {
        databaseService.resetTopTimesGameById.resolves();
        await gameService.resetTopTimesGameById('1');
        expect(databaseService.resetTopTimesGameById.calledOnce).toBe(true);
        expect(databaseService.resetTopTimesGameById.calledWith('1')).toBe(true);
    });

    it('resetAllTopTimes () should call with the right arg resetAllTopTimes() ', async () => {
        databaseService.resetAllTopTimes.resolves();
        await gameService.resetAllTopTimes();
        expect(databaseService.resetAllTopTimes.calledOnce).toBe(true);
    });
});
