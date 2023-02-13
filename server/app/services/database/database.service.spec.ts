import { Game, GameDocument, gameSchema } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { GameListsManagerService } from '@app/services/game-lists-manager/game-lists-manager.service';
import { CarouselPaginator, GameCard, GameConfigConst, ServerSideGame } from '@common/game-interfaces';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
    let dataBaseService: DatabaseService;
    let listsManagerService: SinonStubbedInstance<GameListsManagerService>;
    let gameModel: Model<GameDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    const gameConfigConstTest: GameConfigConst = {
        countdownTime: 300,
        penaltyTime: 250,
        bonusTime: 100,
    };
    const testCarousel: CarouselPaginator[] = [
        {
            hasNext: false,
            hasPrevious: false,
            gameCards: [{} as GameCard],
        },
    ];

    const testGames: ServerSideGame[] = [
        {
            id: '',
            name: 'test',
            isHard: true,
            original: 'data:image/png;base64,test',
            modified: 'data:image/png;base64,test',
            differencesCount: 0,
            differences: [[]],
        },
    ];

    const testGameDto: CreateGameDto = {
        id: 1,
        name: 'test',
        originalImage: 'test',
        modifiedImage: 'test',
        nDifference: 1,
        differences: [[]],
        isHard: true,
    };

    const newGameInDB: Game = {
        name: 'test',
        original: 'assets/test/original.bmp',
        modified: 'assets/test/modified.bmp',
        differences: 'assets/test/differences.json',
        differencesCount: 0,
        isHard: true,
    };
    const DELAY_BEFORE_CLOSING_CONNECTION = 10;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        listsManagerService = createStubInstance(GameListsManagerService);
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: Game.name, schema: gameSchema }]),
            ],
            providers: [DatabaseService, { provide: GameListsManagerService, useValue: listsManagerService }],
        }).compile();

        dataBaseService = module.get<DatabaseService>(DatabaseService);
        gameModel = module.get<Model<GameDocument>>(getModelToken(Game.name));
        connection = await module.get(getConnectionToken());
    });

    afterEach((done) => {
        setTimeout(async () => {
            await connection.close();
            await mongoServer.stop();
            done();
        }, DELAY_BEFORE_CLOSING_CONNECTION);
    });

    it('should be defined', () => {
        expect(dataBaseService).toBeDefined();
        expect(gameModel).toBeDefined();
    });

    it('getGamesCarrousel() should return the games carrousel as expected', async () => {
        dataBaseService['carouselGames'] = testCarousel;
        const addGameCardDB = jest.spyOn(dataBaseService, 'addGameCard');
        expect(await dataBaseService.getGamesCarrousel()).toEqual(testCarousel);
        expect(addGameCardDB).toBeCalled();
    });

    it('getGameById() should return the game as expected', () => {
        dataBaseService['games'] = testGames;
        expect(dataBaseService.getGameById('1')).toEqual(testGames.find((game) => game.id === '1'));
    });

    it('getConfigConstants() should return the constants as expected', () => {
        dataBaseService['defaultConstants'] = gameConfigConstTest;
        expect(dataBaseService.getConfigConstants()).toEqual(gameConfigConstTest);
    });

    it('saveFiles()should store the game bmp and json if the game isnt stored yet', async () => {
        const existSpy = jest.spyOn(fs, 'existsSync');
        const mkDirSpy = jest.spyOn(fs, 'mkdirSync');
        const writeSpy = jest.spyOn(fs, 'writeFileSync');

        dataBaseService.saveFiles(testGames[0]);
        expect(existSpy).toBeCalled();
        expect(mkDirSpy).toBeCalled();
        expect(writeSpy).toBeCalledTimes(3);

        jest.clearAllMocks();

        dataBaseService.saveFiles(testGames[0]);
        expect(existSpy).toBeCalled();
        expect(mkDirSpy).not.toBeCalled();
        expect(writeSpy).not.toBeCalled();
    });

    it('addGameInDb() should add the game to the games list and call createGameFromGameDto and addGameCard ', async () => {
        listsManagerService.createGameFromGameDto.returns(testGames[0]);
        const saveFileSpy = jest.spyOn(dataBaseService, 'saveFiles');
        const eltCountsBefore = await gameModel.countDocuments();
        await dataBaseService.addGameInDb(testGameDto);
        const eltCountsAfter = await gameModel.countDocuments();
        expect(listsManagerService.createGameFromGameDto.calledOnce).toBe(true);
        expect(saveFileSpy).toBeCalledTimes(1);
        expect(eltCountsAfter).toEqual(eltCountsBefore + 1);
    });

    it('addGameInDb() should fail if mongo query failed', async () => {
        jest.spyOn(gameModel, 'create').mockImplementation(async () => Promise.reject(''));
        await expect(dataBaseService.addGameInDb(testGameDto)).rejects.toBeTruthy();
    });

    it('addGameCard() should add games to the games list from database', async () => {
        // eslint-disable-next-line no-param-reassign, no-underscore-dangle
        const id = await (await gameModel.create(newGameInDB))._id.toString();
        const gameInDbToServerSideGameSpy = jest.spyOn(dataBaseService, 'gameInDbToServerSideGame');
        await dataBaseService.addGameCard();
        testGames[0].id = id;
        expect(gameInDbToServerSideGameSpy).toBeCalled();
        expect(dataBaseService['games']).toEqual(testGames);
        expect(dataBaseService['games'].length).toEqual(1);
    });

    it('addGameCard() should add card and game to the game card', async () => {
        dataBaseService['games'].push(testGames[0]);
        // eslint-disable-next-line no-param-reassign, no-underscore-dangle
        await (await gameModel.create(newGameInDB))._id.toString();
        await dataBaseService.addGameCard();
        expect(listsManagerService.buildGameCardFromGame.calledOnce).toBe(true);
        expect(listsManagerService.buildGameCarousel.calledOnce).toBe(true);
        expect(listsManagerService.addGameCarousel.calledOnce).toBe(true);
        expect(dataBaseService['gameCardsList'].length).toEqual(1);
    });

    afterAll(async () => {
        fs.unlinkSync(`assets/${testGames[0].name}/original.bmp`);
        fs.unlinkSync(`assets/${testGames[0].name}/modified.bmp`);
        fs.unlinkSync(`assets/${testGames[0].name}/differences.json`);
        fs.rmdirSync('assets/test/');
    });
});
