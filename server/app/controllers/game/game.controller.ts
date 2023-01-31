import { GameService } from '@app/services/game/game.service';
import { Game, GameCarrousel } from '@common/game-interfaces';
import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Games')
@Controller('games')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Get('carrousel/:index')
    getGameCarrousel(@Param('index') index: number): GameCarrousel {
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
}
