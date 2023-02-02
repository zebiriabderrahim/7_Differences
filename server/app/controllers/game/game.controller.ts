import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { GameService } from '@app/services/game/game.service';
import { Body, Controller, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { Game, GameCarrousel, GameConfig } from '@common/game-interfaces';
import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Games')
@Controller('games')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Get('carrousel/:index')
    getGameCarrousel(@Param('index') index: number, @Res() response: Response) {
        try {
            const gameCarrousel = this.gameService.getGameCarrousel();
            response.status(HttpStatus.OK).json(gameCarrousel[+index]);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @Get(':id')
    gameById(@Param('id') id: string, @Res() response: Response) {
        try {
            const game = this.gameService.getGameById(id);
            response.status(HttpStatus.OK).json(game);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @Post('/')
    addCourse(@Body() gameDto: CreateGameDto, @Res() response: Response) {
        try {
            this.gameService.addGame(gameDto);
            response.status(HttpStatus.CREATED).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }
}
