import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GameController } from './controllers/game/game.controller';
import { GameGateway } from './gateways/game/game.gateway';
import { Game, gameSchema } from './model/database/game';
import { GameCard, gameCardSchema } from './model/database/game-card';
import { ClassicModeService } from './services/classic-mode/classic-mode.service';
import { DatabaseService } from './services/database/database.service';
import { GameListsManagerService } from './services/game-lists-manager/game-lists-manager.service';
import { GameService } from './services/game/game.service';
import { HistoryService } from './services/history/history.service';
import { MessageManagerService } from './services/message-manager/message-manager.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
            }),
        }),
        MongooseModule.forFeature([
            { name: Game.name, schema: gameSchema },
            { name: GameCard.name, schema: gameCardSchema },
        ]),
    ],
    controllers: [GameController],
    providers: [
        Logger,
        GameService,
        DatabaseService,
        ConfigService,
        GameGateway,
        ClassicModeService,
        GameListsManagerService,
        MessageManagerService,
        HistoryService,
    ],
})
export class AppModule {}
