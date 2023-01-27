import { GameService } from '@app/services/game/game.service';
import { Controller, Get, HttpStatus, Res } from '@nestjs/common';

@Controller('games')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Get('/')
    async allGames(@Res() response) {
        try {
            const allGames = await this.gameService.getGames();
            response.status(HttpStatus.OK).json(allGames);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }
}
