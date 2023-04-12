import { Game } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { GameConstantsDto } from '@app/model/dto/game/game-constants.dto';
import { GameService } from '@app/services/game/game.service';
import { CarouselPaginator, GameConfigConst } from '@common/game-interfaces';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { GameController } from './game.controller';

describe('GameController', () => {
    let controller: GameController;
    let gameService: SinonStubbedInstance<GameService>;
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
        gameService = createStubInstance(GameService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameController],
            providers: [
                {
                    provide: GameService,
                    useValue: gameService,
                },
            ],
        }).compile();

        controller = module.get<GameController>(GameController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
    it('getGameCarrousel() should call getGameCarrousel() in gameService', async () => {
        gameService.getGameCarousel.resolves(testCarousel);
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (gameCarrousel) => {
            expect(gameCarrousel).toEqual(testCarousel[0]);
            return res;
        };
        res.send = () => res;
        await controller.getGameCarrousel(0, res);
        expect(gameService.getGameCarousel.calledOnce).toBe(true);
    });

    it('getGameCarrousel() should return NOT_FOUND when service unable to fetch GameCarrousel', async () => {
        gameService.getGameCarousel.rejects();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;
        await controller.getGameCarrousel(0, res);
        expect(gameService.getGameCarousel.called).toBe(true);
    });

    it('getGameById() should call getGameById() in gameService', async () => {
        gameService.getGameById.resolves(testGame);
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (game) => {
            expect(game).toEqual(testGame);
            return res;
        };
        res.send = () => res;
        await controller.gameById('0', res);
        expect(gameService.getGameById.calledOnce).toBeTruthy();
    });

    it('getGameById() should return NOT_FOUND when service unable to fetch Game', async () => {
        gameService.getGameById.throwsException();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.json = (game) => {
            expect(game).toEqual(undefined);
            return res;
        };
        res.send = () => res;
        await controller.gameById('0', res);
        expect(gameService.getGameById).toThrow();
        expect(gameService.getGameById.called).toBeTruthy();
    });

    it('getConfigConstants() should call getConfigConstants() in gameService', async () => {
        gameService.getGameConstants.resolves(gameConfigConstTest);
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (gameConfigConst) => {
            expect(gameConfigConst).toEqual(gameConfigConstTest);
            return res;
        };
        res.send = () => res;
        await controller.getGameConstants(res);
        expect(gameService.getGameConstants.calledOnce).toBeTruthy();
    });

    it('getGameConstants() should return NOT_FOUND when service unable to fetch game GameConstants', async () => {
        gameService.getGameConstants.rejects();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.json = (gameConfigConst) => {
            expect(gameConfigConst).toEqual(undefined);
            return res;
        };
        res.send = () => res;
        await controller.getGameConstants(res);
        expect(gameService.getGameConstants.called).toBeTruthy();
    });

    it('addGame()should call addGame() in gameService', async () => {
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CREATED);
            return res;
        };
        res.send = () => res;
        await controller.addGame(new CreateGameDto(), res);
        expect(gameService.addGame.calledOnce).toBeTruthy();
    });

    it('addGame() should return NOT_FOUND when service unable to add new game', async () => {
        gameService.addGame.throwsException();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = () => res;
        await controller.addGame(new CreateGameDto(), res);
        expect(gameService.addGame).toThrow();
        expect(gameService.addGame.called).toBeTruthy();
    });
    it('verifyIfGameExists() should call verifyIfGameExists() in gameService', async () => {
        gameService.verifyIfGameExists.resolves(true);
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (game) => {
            expect(game).toEqual(true);
            return res;
        };
        res.send = () => res;
        await controller.verifyIfGameExists('0', res);
        expect(gameService.verifyIfGameExists.calledOnce).toBeTruthy();
    });

    it('deleteGameById() should call deleteGameById() in gameService', async () => {
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;
        await controller.deleteGameById('0', res);
        expect(gameService.deleteGameById.calledOnce).toBeTruthy();
    });

    it('deleteGameById() should return NOT_FOUND when service unable to delete game', async () => {
        gameService.deleteGameById.throwsException();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NO_CONTENT);
            return res;
        };
        res.send = () => res;
        await controller.deleteGameById('0', res);
        expect(gameService.deleteGameById).toThrow();
        expect(gameService.deleteGameById.called).toBeTruthy();
    });

    it('deleteAllGames() should call deleteAllGames() in gameService', async () => {
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;
        await controller.deleteAllGames(res);
        expect(gameService.deleteAllGames.calledOnce).toBeTruthy();
    });

    it('deleteAllGames() should return NOT_FOUND when service unable to delete all games', async () => {
        gameService.deleteAllGames.throwsException();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NO_CONTENT);
            return res;
        };
        res.send = () => res;
        await controller.deleteAllGames(res);
        expect(gameService.deleteAllGames).toThrow();
        expect(gameService.deleteAllGames.called).toBeTruthy();
    });

    it('updateGameConstants() should call updateGameConstants() in gameService', async () => {
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;
        await controller.updateGameConstants(new GameConstantsDto(), res);
        expect(gameService.updateGameConstants.calledOnce).toBeTruthy();
    });

    it('updateGameConstants() should return NOT_FOUND when service unable to update game constants', async () => {
        gameService.updateGameConstants.throwsException();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NO_CONTENT);
            return res;
        };
        res.send = () => res;
        await controller.updateGameConstants(new GameConstantsDto(), res);
        expect(gameService.updateGameConstants).toThrow();
        expect(gameService.updateGameConstants.called).toBeTruthy();
    });
});
