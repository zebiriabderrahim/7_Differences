import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { GameService } from '@app/services/game/game.service';
import { Body, Controller, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { GameConfigConst } from '@common/game-interfaces';

@ApiTags('Games')
@Controller('games')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Get('/constants')
    getConfigConstants(@Res() response: Response) {
        try {
            const gameConfigConstants = this.gameService.getConfigConstants();
            response.status(HttpStatus.OK).json(gameConfigConstants);
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

    @Get('carousel/:index')
    async getGameCarrousel(@Param('index') index: number, @Res() response: Response) {
        try {
            const gameCarrousel = await this.gameService.getGameCarousel();
            response.status(HttpStatus.OK).json(gameCarrousel[+index]);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @Post()
    addGame(@Body() gameDto: CreateGameDto, @Res() response: Response) {
        try {
            this.gameService.addGame(gameDto);
            response.status(HttpStatus.CREATED).send();
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }
}
