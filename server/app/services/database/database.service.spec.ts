// Id comes from database to allow _id
/* eslint-disable no-underscore-dangle */
import { Game, GameDocument, gameSchema } from '@app/model/database/game';
import { GameCard, GameCardDocument, gameCardSchema } from '@app/model/database/game-card';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { GameListsManagerService } from '@app/services/game-lists-manager/game-lists-manager.service';
import { CarouselPaginator, GameConfigConst, PlayerTime } from '@common/game-interfaces';
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
    let gameCardModel: Model<GameCardDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    const defaultBestTimes: PlayerTime[] = [
        { name: 'John Doe', time: 100 },
        { name: 'Jane Doe', time: 200 },
        { name: 'the scream', time: 250 },
    ];

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

    const testGames: Game[] = [
        {
            _id: '1',
            name: 'test',
            isHard: true,
            originalImage: 'test',
            modifiedImage: 'test',
            nDifference: 1,
            differences: 'test',
        },
    ];

    const testGameDto: CreateGameDto = {
        name: 'test',
        originalImage: 'test',
        modifiedImage: 'test',
        nDifference: 1,
        differences: [[]],
        isHard: true,
    };

    const newGameInDB: Game = {
        name: 'test',
        originalImage: 'assets/test/original.bmp',
        modifiedImage: 'assets/test/modified.bmp',
        differences: 'assets/test/differences.json',
        nDifference: 0,
        isHard: true,
    };
    const testGameCards: GameCard[] = [
        {
            _id: '1',
            name: 'test',
            difficultyLevel: true,
            soloTopTime: defaultBestTimes,
            oneVsOneTopTime: defaultBestTimes,
            thumbnail: 'assets/test/modified.bmp',
        },
    ];
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
                MongooseModule.forFeature([
                    { name: Game.name, schema: gameSchema },
                    { name: GameCard.name, schema: gameCardSchema },
                ]),
            ],
            providers: [DatabaseService, { provide: GameListsManagerService, useValue: listsManagerService }],
        }).compile();

        dataBaseService = module.get<DatabaseService>(DatabaseService);
        gameModel = module.get<Model<GameDocument>>(getModelToken(Game.name));
        gameCardModel = module.get<Model<GameCardDocument>>(getModelToken(GameCard.name));
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
        expect(gameCardModel).toBeDefined();
    });

    it('getGamesCarrousel() should return the games carrousel as expected', async () => {
        listsManagerService['carouselGames'] = [];
        gameCardModel.find().exec = jest.fn().mockResolvedValue(testGameCards);
        const buildGameCarouselSpy = jest
            .spyOn(listsManagerService, 'buildGameCarousel')
            .mockImplementation(() => (listsManagerService['carouselGames'] = testCarousel));
        const gameCardList = await dataBaseService.getGamesCarrousel();
        expect(gameCardList).toEqual(testCarousel);
        expect(buildGameCarouselSpy).toBeCalled();
        expect(buildGameCarouselSpy).toHaveBeenCalledWith([]);
    });

    it('getGameById() should return the game as expected', async () => {
        const id = (await gameModel.create(newGameInDB))._id.toString();
        const testGames1: Game = {
            _id: id,
            name: 'test',
            originalImage: 'assets/test/original.bmp',
            modifiedImage: 'assets/test/modified.bmp',
            nDifference: 0,
            differences: 'assets/test/differences.json',
            isHard: true,
        };
        const findByIdSpy = jest.spyOn(gameModel, 'findById');
        const game = await dataBaseService.getGameById(id);
        expect(findByIdSpy).toBeCalledWith(id, '-__v');
        expect(JSON.stringify(game)).toEqual(JSON.stringify(testGames1));
    });

    it('getConfigConstants() should return the constants as expected', () => {
        dataBaseService['defaultConstants'] = gameConfigConstTest;
        expect(dataBaseService.getConfigConstants()).toEqual(gameConfigConstTest);
    });

    it('verifyIfGameExists() should return true if the game exists', async () => {
        await gameModel.create(newGameInDB);
        const existsSpy = jest.spyOn(gameModel, 'exists');
        const result = await dataBaseService.verifyIfGameExists('test');
        expect(existsSpy).toBeCalledWith({ name: newGameInDB.name });
        expect(result).toBe(true);
    });

    it('saveFiles()should store the game bmp and json if the game isnt stored yet', async () => {
        const existSpy = jest.spyOn(fs, 'existsSync');
        const mkDirSpy = jest.spyOn(fs, 'mkdirSync');
        const writeSpy = jest.spyOn(fs, 'writeFileSync');
        const fromSpy = jest.spyOn(Buffer, 'from');

        dataBaseService.saveFiles(testGameDto);
        expect(existSpy).toBeCalled();
        expect(mkDirSpy).toBeCalled();
        expect(writeSpy).toBeCalledTimes(3);
        expect(fromSpy).toBeCalledTimes(3);

        jest.clearAllMocks();

        dataBaseService.saveFiles(testGameDto);
        expect(existSpy).toBeCalled();
        expect(fromSpy).toBeCalledTimes(2);
        expect(mkDirSpy).not.toBeCalled();
        expect(writeSpy).not.toBeCalled();
    });

    it('addGameInDb() should add the game to the games list and call createGameFromGameDto and addGameCard ', async () => {
        const saveFileSpy = jest.spyOn(dataBaseService, 'saveFiles');
        const createSpy = jest.spyOn(gameModel, 'create');
        testGameCards[0]._id = (await gameModel.create(newGameInDB))._id.toString();
        listsManagerService.buildGameCardFromGame.returns(testGameCards[0]);
        await dataBaseService.addGameInDb(testGameDto);
        const result = await dataBaseService.verifyIfGameExists(testGameDto.name);
        expect(result).toBe(true);
        expect(saveFileSpy).toBeCalledTimes(1);
        expect(createSpy).toBeCalledTimes(2);
        expect(listsManagerService.buildGameCardFromGame.called).toBeTruthy();
        expect(listsManagerService.addGameCarousel.called).toBeTruthy();
    });

    it('addGameInDb() should fail if mongo query failed', async () => {
        jest.spyOn(gameModel, 'create').mockImplementation(async () => Promise.reject(''));
        await expect(dataBaseService.addGameInDb(testGameDto)).rejects.toBeTruthy();
    });

    afterAll(async () => {
        fs.unlinkSync(`assets/${testGames[0].name}/original.bmp`);
        fs.unlinkSync(`assets/${testGames[0].name}/modified.bmp`);
        fs.unlinkSync(`assets/${testGames[0].name}/differences.json`);
        fs.rmdirSync('assets/test/');
    });
});
