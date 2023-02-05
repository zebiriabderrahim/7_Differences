import { Logger, Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { Course, courseSchema } from '@app/model/database/course';
// import { CourseController } from '@app/controllers/course/course.controller';
// import { CourseService } from '@app/services/course/course.service';
// import { DateController } from '@app/controllers/date/date.controller';
// import { ExampleController } from '@app/controllers/example/example.controller';
// import { ChatGateway } from '@app/gateways/chat/chat.gateway';
// import { DateService } from '@app/services/date/date.service';
// import { ExampleService } from '@app/services/example/example.service';
import { GameService } from './services/game/game.service';
import { GameController } from './controllers/game/game.controller';
import { DatabaseService } from './services/database/database.service';
import { GameListsService } from './services/game-lists/game-lists.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        // MongooseModule.forRootAsync({
        //     imports: [ConfigModule],
        //     inject: [ConfigService],
        //     useFactory: async (config: ConfigService) => ({
        //         uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
        //     }),
        // }),
        // MongooseModule.forFeature([{ name: Course.name, schema: courseSchema }]),
    ],
    // controllers: [CourseController, DateController, ExampleController],
    // providers: [ChatGateway, CourseService, DateService, ExampleService, Logger],
    controllers: [GameController],
    providers: [Logger, GameService, DatabaseService, ConfigService, GameListsService],
})
export class AppModule {}
