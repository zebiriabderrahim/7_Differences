import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '@app/services/database/database.service';
import { GameService } from './game.service';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Game, GameConfigConst } from '@common/game-interfaces';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';

describe('GameService', () => {
    let service: GameService;
    let databaseService: SinonStubbedInstance<DatabaseService>;

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

    it('should call getConfigConstants() in databaseService', () => {
        const fakeGameConfigConst = {} as GameConfigConst;
        databaseService.getConfigConstants.returns(fakeGameConfigConst);
        expect(service.getConfigConstants()).toEqual(fakeGameConfigConst);
        expect(databaseService.getConfigConstants.calledOnce).toBe(true);
    });

    it('should throw NotFoundException when getConfigConstants() in databaseService unable to found GameConfigConst ', () => {
        databaseService.getConfigConstants.returns(undefined);
        expect(() => service.getConfigConstants()).toThrowError();
        expect(databaseService.getConfigConstants.calledOnce).toBe(true);
    });
    it('should call getGamesCarrousel() in databaseService', () => {
        const fakeGamesCarrousel = [];
        databaseService.getGamesCarrousel.returns(fakeGamesCarrousel);
        expect(service.getGameCarousel()).toEqual(fakeGamesCarrousel);
        expect(databaseService.getGamesCarrousel.calledOnce).toBe(true);
    });

    it('should call getGameById() in databaseService', () => {
        const fakeGame = {} as Game;
        databaseService.getGameById.returns(fakeGame);
        expect(service.getGameById('fakeId')).toEqual(fakeGame);
        expect(databaseService.getGameById.calledOnce).toBe(true);
    });

    it('should throw HttpException when getGameById() in databaseService unable to found Game', () => {
        databaseService.getGameById.returns(undefined);
        expect(() => service.getGameById('fakeId')).toThrowError();
        expect(databaseService.getGameById.calledOnce).toBe(true);
    });

    it('should call addGame() in databaseService', () => {
        const fakeGame = new CreateGameDto();
        service.addGame(fakeGame)
        expect(databaseService.addGame.calledOnce).toBe(true);
    });
});
