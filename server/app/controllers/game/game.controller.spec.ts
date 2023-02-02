import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { GameService } from '@app/services/game/game.service';
import { CarrouselPaginator, Game, GameConfigConst } from '@common/game-interfaces';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { GameController } from './game.controller';

describe('GameController', () => {
    let controller: GameController;
    let gameService: SinonStubbedInstance<GameService>;

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
    it('getGameCarrousel() should call getGameCarrousel() in gameService', () => {
        const fakeGameCarrousel = {} as CarrouselPaginator[];
        gameService.getGameCarousel.returns(fakeGameCarrousel);
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (gameCarrousel) => {
            expect(gameCarrousel).toEqual(fakeGameCarrousel[0]);
            return res;
        };
        res.send = () => res;
        controller.getGameCarrousel(0, res);
        expect(gameService.getGameCarousel.calledOnce).toBe(true);
    });

    it('getGameCarrousel() should return NOT_FOUND when service unable to fetch GameCarrousel', async () => {
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;
        controller.getGameCarrousel(0, res);
        expect(gameService.getGameCarousel.calledOnce).toBe(true);
    });

    it('getGameById() should call getGameById() in gameService', () => {
        const fakeGame = { id: 0 } as Game;
        gameService.getGameById.returns(fakeGame);
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (game) => {
            expect(game).toEqual(fakeGame);
            return res;
        };
        res.send = () => res;
        controller.gameById('0', res);
        expect(gameService.getGameById.calledOnce).toBe(true);
    });

    it('getGameById() should return NOT_FOUND when service unable to fetch Game', () => {
        gameService.getGameById.returns(undefined);
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
        controller.gameById('0', res);
        expect(gameService.getGameById.calledOnce).toBe(true);
    });

    it('getConfigConstants() should call getConfigConstants() in gameService', () => {
        const fakeGameConfigConst = {} as GameConfigConst;
        gameService.getConfigConstants.returns(fakeGameConfigConst);
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (gameConfigConst) => {
            expect(gameConfigConst).toEqual(fakeGameConfigConst);
            return res;
        };
        res.send = () => res;
        controller.getConfigConstants(res);
        expect(gameService.getConfigConstants.calledOnce).toBe(true);
    });

    it('getConfigConstants() should return NOT_FOUND when service unable to fetch game ConfigConstants', () => {
        gameService.getConfigConstants.returns(undefined);
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
        controller.getConfigConstants(res);
        expect(gameService.getConfigConstants.calledOnce).toBe(true);
    });

    it('addCourse()should call addCourse() in gameService', () => {
        gameService.addGame.resolves();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CREATED);
            return res;
        };
        res.send = () => res;
        controller.addGame(new CreateGameDto(), res);
        expect(gameService.addGame.calledOnce).toBe(true);
    });

    it('addCourse() should return NOT_FOUND when service unable to add new game', () => {
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;
        controller.addGame(new CreateGameDto(), res);
        expect(gameService.addGame.calledOnce).toBe(true);
    });
});
