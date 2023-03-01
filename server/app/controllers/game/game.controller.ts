import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { GameService } from '@app/services/game/game.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Query, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

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
    async gameById(@Param('id') id: string, @Res() response: Response) {
        try {
            const game = await this.gameService.getGameById(id);
            response.status(HttpStatus.OK).json(game);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @Get()
    async verifyIfGameExists(@Query('name') name: string, @Res() response: Response) {
        console.log(name);
        const gameExists = await this.gameService.verifyIfGameExists(name);
        response.status(HttpStatus.OK).json(gameExists);
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
    async addGame(@Body() gameDto: CreateGameDto, @Res() response: Response) {
        try {
            await this.gameService.addGame(gameDto);
            response.status(HttpStatus.CREATED).send();
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }

    @Delete(':id')
    async deleteGameById(@Param('id') id: string, @Res() response: Response) {
        try {
            await this.gameService.deleteGameById(id);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NO_CONTENT).send(error.message);
        }
    }
}
