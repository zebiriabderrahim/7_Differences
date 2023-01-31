import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { GameService } from '@app/services/game/game.service';
import { Game, CarrouselPaginator } from '@common/game-interfaces';
import { Body, Controller, Get, HttpStatus, NotFoundException, Param, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Games')
@Controller('games')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Get('carrousel/:index')
    getGameCarrousel(@Param('index') index: number): CarrouselPaginator {
        const gameCarrousel = this.gameService.getGames();
        return gameCarrousel[+index];
    }

    @Get(':id')
    gameById(@Param('id') id: string): Game {
        const game = this.gameService.getGameById(id);
        if (!game) {
            throw new NotFoundException(`Game with id:${id} not found`);
        }
        return game;
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
