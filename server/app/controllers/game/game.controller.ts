import { GameService } from '@app/services/game/game.service';
import { Game, GameCard } from '@common/game-interfaces';
import { Controller, Get, HttpStatus, NotFoundException, Param, Res } from '@nestjs/common';

@Controller('games')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Get()
    async allGameCards(): Promise<GameCard[]> {
        const allGameCards = await this.gameService.getGames();
        return allGameCards;
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
