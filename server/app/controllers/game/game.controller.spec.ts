import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { GameService } from '@app/services/game/game.service';
import { CarouselPaginator, GameConfigConst, ServerSideGame } from '@common/game-interfaces';
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

    const testGame: ServerSideGame = {
        id: 'test',
        name: 'test',
        isHard: true,
        original: 'test',
        modified: 'test',
        differencesCount: 1,
        differences: [[]],
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

    it('getGameById() should call getGameById() in gameService', () => {
        gameService.getGameById.returns(testGame);
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
        controller.gameById('0', res);
        expect(gameService.getGameById.calledOnce).toBeTruthy();
    });

    it('getGameById() should return NOT_FOUND when service unable to fetch Game', () => {
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
        controller.gameById('0', res);
        expect(gameService.getGameById).toThrow();
        expect(gameService.getGameById.called).toBeTruthy();
    });

    it('getConfigConstants() should call getConfigConstants() in gameService', () => {
        gameService.getConfigConstants.returns(gameConfigConstTest);
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
        controller.getConfigConstants(res);
        expect(gameService.getConfigConstants.calledOnce).toBeTruthy();
    });

    it('getConfigConstants() should return NOT_FOUND when service unable to fetch game ConfigConstants', () => {
        gameService.getConfigConstants.throwsException();
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
        expect(gameService.getConfigConstants).toThrow();
        expect(gameService.getConfigConstants.called).toBeTruthy();
    });

    it('addGame()should call addGame() in gameService', () => {
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CREATED);
            return res;
        };
        res.send = () => res;
        controller.addGame(new CreateGameDto(), res);
        expect(gameService.addGame.calledOnce).toBeTruthy();
    });

    it('addGame() should return NOT_FOUND when service unable to add new game', () => {
        gameService.addGame.throwsException();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = () => res;
        controller.addGame(new CreateGameDto(), res);
        expect(gameService.addGame).toThrow();
        expect(gameService.addGame.called).toBeTruthy();
    });
});
