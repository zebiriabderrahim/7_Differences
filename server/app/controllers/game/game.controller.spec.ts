import { GameService } from '@app/services/game/game.service';
import { CarrouselPaginator, Game } from '@common/game-interfaces';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { GameController } from './game.controller';
import { Response } from 'express';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';

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
        gameService.getGameCarrousel.returns(fakeGameCarrousel);
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (courses) => {
            expect(courses).toEqual(fakeGameCarrousel[0]);
            return res;
        };
        res.send = () => res;
        controller.getGameCarrousel(0, res);
    });

    it('getGameCarrousel() should return NOT_FOUND when service unable to fetch GameCarrousel', async () => {
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;
        controller.getGameCarrousel(0, res);
    });

    it('getGameById() should call getGameById() in gameService', () => {
        const fakeGame = { id: 0 } as Game;
        gameService.getGameById.returns(fakeGame);
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (courses) => {
            expect(courses).toEqual(fakeGame);
            return res;
        };
        res.send = () => res;
        controller.gameById('0', res);
    });

    it('getGameById() should return NOT_FOUND when service unable to fetch Game', () => {
        gameService.getGameById.returns(undefined);
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.json = (courses) => {
            expect(courses).toEqual(undefined);
            return res;
        };
        res.send = () => res;
        controller.gameById('0', res);
    });

    it('addCourse()should call addCourse() in gameService', () => {
        gameService.addGame.resolves();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CREATED);
            return res;
        };
        res.send = () => res;
        controller.addCourse(new CreateGameDto(), res);
    });

    it('addCourse()should call addCourse() in gameService', () => {
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;
        controller.addCourse(new CreateGameDto(), res);
    });
});
