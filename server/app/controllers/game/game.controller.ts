import { GameService } from '@app/services/game/game.service';
import { Game, GameCarrousel } from '@common/game-interfaces';
import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Games')
@Controller('games')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Get('carrousel/:index')
    async getGameCarrousel(@Param('index') index: number): Promise<GameCarrousel> {
        const gameCarrousel = await this.gameService.getGames();
        return gameCarrousel[+index];
    }

    @Get(':id')
    async gameById(@Param('id') id: string): Promise<Game> {
        const game = await this.gameService.getGameById(id);
        if (!game) {
            throw new NotFoundException(`Game with id:${id} not found`);
        }
        return game;
    }
}
