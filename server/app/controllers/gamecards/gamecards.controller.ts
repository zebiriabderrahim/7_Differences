import { GamecardsService } from '@app/services/gamecards/gamecards.service';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Gamecards')
@Controller('gamecards')
export class GamecardsController {
    constructor(private readonly gamecardsService: GamecardsService) {}

    @Get('/game')
    loadCurrentStackGame() {
        return this.gamecardsService.gameCards;
    }
}
