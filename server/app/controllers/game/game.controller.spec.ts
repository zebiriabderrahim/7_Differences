import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { GameService } from '@app/services/game/game.service';
import { CarouselPaginator, Game, GameConfigConst } from '@common/game-interfaces';
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
        gameService.getGameCarousel.returns(testCarousel);
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
        controller.getGameCarrousel(0, res);
        expect(gameService.getGameCarousel.calledOnce).toBe(true);
    });

    it('getGameCarrousel() should return NOT_FOUND when service unable to fetch GameCarrousel', () => {
        gameService.getGameCarousel.throwsException();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;
        controller.getGameCarrousel(0, res);
        expect(gameService.getGameCarousel).toThrow();
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
        expect(gameService.getGameById.calledOnce).toBe(true);
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
        expect(gameService.getGameById.called).toBe(true);
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
        expect(gameService.getConfigConstants.calledOnce).toBe(true);
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
        expect(gameService.getConfigConstants.called).toBe(true);
    });

    it('addCourse()should call addCourse() in gameService', () => {
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
        gameService.addGame.throwsException();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;
        controller.addGame(new CreateGameDto(), res);
        expect(gameService.addGame).toThrow();
        expect(gameService.addGame.called).toBe(true);
    });
});
