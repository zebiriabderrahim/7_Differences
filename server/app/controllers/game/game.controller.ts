import { GameService } from '@app/services/game/game.service';
import { Game, GameCard } from '@common/game-interfaces';
import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Games')
@Controller('games')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Get()
    async allGameCards(): Promise<GameCard[]> {
        const allGameCards = await this.gameService.getGameCards();
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
