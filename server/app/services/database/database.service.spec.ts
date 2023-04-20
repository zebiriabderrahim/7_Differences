/* eslint-disable max-lines */
// Id comes from database to allow _id
/* eslint-disable no-underscore-dangle */
import { Game, GameDocument, gameSchema } from '@app/model/database/game';
import { GameCard, GameCardDocument, gameCardSchema } from '@app/model/database/game-card';
import { GameConstants, GameConstantsDocument, gameConstantsSchema } from '@app/model/database/game-config-constants';
import { GameHistory, gameHistorySchema } from '@app/model/database/game-history';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { GameConstantsDto } from '@app/model/dto/game/game-constants.dto';
import { GameListsManagerService } from '@app/services/game-lists-manager/game-lists-manager.service';
import { GameModes } from '@common/enums';
import { CarouselPaginator, PlayerTime } from '@common/game-interfaces';
import { MongooseModule, getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
    let dataBaseService: DatabaseService;
    let listsManagerService: SinonStubbedInstance<GameListsManagerService>;
    let gameModel: Model<GameDocument>;
    let gameCardModel: Model<GameCardDocument>;
    let gameConstantsModel: Model<GameConstantsDocument>;
    let gameHistoryModel: Model<GameHistory>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    const defaultBestTimes: PlayerTime[] = [
        { name: 'John Doe', time: 100 },
        { name: 'Jane Doe', time: 200 },
        { name: 'the scream', time: 250 },
    ];

    const defaultBestTimes2: PlayerTime[] = [
        { name: 'John Doe', time: 70 },
        { name: 'Jane Doe', time: 10 },
        { name: 'the scream', time: 20 },
    ];

    const gameConfigConstTest: GameConstantsDto = {
        countdownTime: 30,
        penaltyTime: 5,
        bonusTime: 5,
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

    const gameHistoryTest: GameHistory = {
        gameMode: GameModes.ClassicOneVsOne,
        player1: { name: 'John Doe', isWinner: true, isQuitter: false },
        player2: { name: 'Jane Doe', isWinner: false, isQuitter: false },
        duration: 100,
        startingHour: '2020-01-01T00:00:00.000Z',
        date: '2020-01-01T00:00:00.000Z',
    };

    const DELAY_BEFORE_CLOSING_CONNECTION = 50;

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
                    { name: GameConstants.name, schema: gameConstantsSchema },
                    { name: GameHistory.name, schema: gameHistorySchema },
                ]),
            ],
            providers: [DatabaseService, { provide: GameListsManagerService, useValue: listsManagerService }],
        }).compile();

        dataBaseService = module.get<DatabaseService>(DatabaseService);
        gameModel = module.get<Model<GameDocument>>(getModelToken(Game.name));
        gameCardModel = module.get<Model<GameCardDocument>>(getModelToken(GameCard.name));
        gameConstantsModel = module.get<Model<GameConstantsDocument>>(getModelToken(GameConstants.name));
        gameHistoryModel = module.get<Model<GameHistory>>(getModelToken(GameHistory.name));
        connection = await module.get(getConnectionToken());
    });

    afterEach((done) => {
        setTimeout(async () => {
            await connection.close();
            await mongoServer.stop();
            done();
        }, DELAY_BEFORE_CLOSING_CONNECTION);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(dataBaseService).toBeDefined();
        expect(gameModel).toBeDefined();
        expect(gameCardModel).toBeDefined();
        expect(gameConstantsModel).toBeDefined();
        expect(gameHistoryModel).toBeDefined();
    });

    it('onModuleInit should call the getAllGameIds and populateDbWithGameConstants method ', async () => {
        await dataBaseService.onModuleInit();
        expect(dataBaseService['gameIds']).toEqual([]);
    });

    it('getGamesCarrousel() should return the games carrousel as expected', async () => {
        listsManagerService['carouselGames'] = [];
        gameCardModel.find().exec = jest.fn().mockResolvedValue(testGameCards);
        const buildGameCarouselSpy = jest
            .spyOn(listsManagerService, 'buildGameCarousel')
            .mockImplementation(() => (listsManagerService['carouselGames'] = testCarousel));
        const getCarouselGamesSpy = jest.spyOn(listsManagerService, 'getCarouselGames').mockReturnValue(testCarousel);
        const gameCardList = await dataBaseService.getGamesCarrousel();
        expect(gameCardList).toEqual(testCarousel);
        expect(buildGameCarouselSpy).toBeCalled();
        expect(buildGameCarouselSpy).toHaveBeenCalledWith([]);
        expect(getCarouselGamesSpy).toBeCalled();
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

    it('getGameById() should fail if mongo query failed ', async () => {
        jest.spyOn(gameModel, 'findById').mockImplementation(() => {
            throw new Error('Mock MongoDB error');
        });
        await expect(dataBaseService.getGameById('1')).rejects.toBeTruthy();
    });

    it('getTopTimesGameById should return the top times of the game as expected (soloTopTime case) ', async () => {
        const id = (await gameModel.create(newGameInDB))._id.toString();
        testGameCards[0]._id = id;
        await gameCardModel.create(testGameCards[0]);
        const topTime = await dataBaseService.getTopTimesGameById(id, GameModes.ClassicSolo);
        expect(JSON.stringify(topTime)).toEqual(JSON.stringify(testGameCards[0].soloTopTime));
    });

    it('getTopTimesGameById should should fail if mongo query failed ', async () => {
        jest.spyOn(gameCardModel, 'findOne').mockImplementation(() => {
            throw new Error('Mock MongoDB error');
        });
        await expect(dataBaseService.getTopTimesGameById('1', GameModes.ClassicSolo)).rejects.toBeTruthy();
    });

    it('getTopTimesGameById should return the top times of the game as expected (oneVsOneTopTime case)', async () => {
        const id = (await gameModel.create(newGameInDB))._id.toString();
        testGameCards[0]._id = id;
        await gameCardModel.create(testGameCards[0]);
        const topTime = await dataBaseService.getTopTimesGameById(id, GameModes.ClassicOneVsOne);
        expect(JSON.stringify(topTime)).toEqual(JSON.stringify(testGameCards[0].oneVsOneTopTime));
    });
    it('getGameConstants() should return the constants as expected', async () => {
        await gameConstantsModel.create(gameConfigConstTest);
        const findOneId = jest.spyOn(gameConstantsModel, 'findOne');
        const gameConstants = await dataBaseService.getGameConstants();
        expect(JSON.stringify(gameConstants)).toEqual(JSON.stringify(gameConfigConstTest));
        expect(findOneId).toBeCalled();
    });

    it('getGameConstants() should fail if mongo query failed ', async () => {
        jest.spyOn(gameConstantsModel, 'findOne').mockImplementation(() => {
            throw new Error('Mock MongoDB error');
        });
        await expect(dataBaseService.getGameConstants()).rejects.toBeTruthy();
    });

    it('verifyIfGameExists() should return true if the game exists', async () => {
        await gameModel.create(newGameInDB);
        const existsSpy = jest.spyOn(gameModel, 'exists');
        const result = await dataBaseService.verifyIfGameExists('test');
        expect(existsSpy).toBeCalledWith({ name: newGameInDB.name });
        expect(result).toBe(true);
    });

    it('verifyIfGameExists() should should fail if mongo query failed ', async () => {
        jest.spyOn(gameModel, 'exists').mockImplementation(() => {
            throw new Error('Mock MongoDB error');
        });
        await expect(dataBaseService.verifyIfGameExists('test')).rejects.toBeTruthy();
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
        const gameModelCreateSpy = jest.spyOn(gameModel, 'create');
        const gameCardModelCreateSpy = jest.spyOn(gameCardModel, 'create');
        testGameCards[0]._id = (await gameModel.create(newGameInDB))._id.toString();
        listsManagerService.buildGameCardFromGame.returns(testGameCards[0]);
        await dataBaseService.addGameInDb(testGameDto);
        const result = await dataBaseService.verifyIfGameExists(testGameDto.name);
        expect(result).toBe(true);
        expect(saveFileSpy).toBeCalledTimes(1);
        expect(gameModelCreateSpy).toBeCalledTimes(2);
        expect(gameCardModelCreateSpy).toBeCalledTimes(1);
        expect(listsManagerService.buildGameCardFromGame.called).toBeTruthy();
        expect(listsManagerService.addGameCarousel.called).toBeTruthy();
    });

    it('deleteGameById() should fail if mongo query failed', async () => {
        jest.spyOn(gameModel, 'create').mockImplementation(async () => Promise.reject(''));
        await expect(dataBaseService.addGameInDb(testGameDto)).rejects.toBeTruthy();
    });

    it('deleteGameById() should delete the game from the games list and call deleteGameCard ', async () => {
        const findByIdAndDeleteGameSpy = jest.spyOn(gameModel, 'findByIdAndDelete');
        const findByIdAndDeleteGameCardSpy = jest.spyOn(gameCardModel, 'findByIdAndDelete');
        const deleteGameAssetsByNameSpy = jest.spyOn(dataBaseService, 'deleteGameAssetsByName').mockImplementation(() => {
            return;
        });
        dataBaseService['rebuildGameCarousel'] = jest.fn();
        gameCardModel.find().exec = jest.fn().mockResolvedValue(testGameCards);
        const id = (await gameModel.create(newGameInDB))._id.toString();
        testGameCards[0]._id = id;
        dataBaseService['gameIds'] = [testGameCards[0]._id];
        await gameCardModel.create(testGameCards[0]);
        await dataBaseService.deleteGameById(id);
        expect(findByIdAndDeleteGameSpy).toBeCalledWith(id);
        expect(findByIdAndDeleteGameCardSpy).toBeCalledWith(id);
        expect(deleteGameAssetsByNameSpy).toBeCalledWith(testGameDto.name);
        expect(dataBaseService['rebuildGameCarousel']).toBeCalled();
    });

    it('deleteGame() should fail if mongo query failed', async () => {
        gameCardModel.find().exec = jest.fn().mockRejectedValue('');
        await expect(dataBaseService.deleteGameById('test')).rejects.toBeTruthy();
    });

    it('deleteGameAssetsByName() should delete the game assets', () => {
        const unlinkSpy = jest.spyOn(fs, 'unlinkSync');
        const rmdirSpy = jest.spyOn(fs, 'rmdirSync');
        dataBaseService.deleteGameAssetsByName(testGames[0].name);
        expect(unlinkSpy).toBeCalledTimes(3);
        expect(rmdirSpy).toBeCalledTimes(1);
    });

    it('deleteAllGames should delete all the games', async () => {
        await gameModel.create(newGameInDB);
        const deleteGameAssetsByNameSpy = jest.spyOn(dataBaseService, 'deleteGameAssetsByName').mockImplementation(() => {
            return;
        });
        const deleteManySpy = jest.spyOn(gameModel, 'deleteMany');
        const deleteManySpy2 = jest.spyOn(gameCardModel, 'deleteMany');
        await dataBaseService.deleteAllGames();
        expect(deleteManySpy).toBeCalled();
        expect(deleteManySpy2).toBeCalled();
        expect(deleteGameAssetsByNameSpy).toBeCalledTimes(1);
    });

    it('deleteAllGames should fail if mongo query failed', async () => {
        jest.spyOn(gameCardModel, 'deleteMany').mockImplementation(() => {
            throw new Error('Mock MongoDB error');
        });
        await expect(dataBaseService.deleteAllGames()).rejects.toBeTruthy();
    });

    it('updateTopTimesGameById() should update the top times of the game as expected (soloTopTime cas)', async () => {
        const id = (await gameModel.create(newGameInDB))._id.toString();
        dataBaseService['rebuildGameCarousel'] = jest.fn();
        testGameCards[0]._id = id;
        await gameCardModel.create(testGameCards[0]);
        await dataBaseService.updateTopTimesGameById(id, GameModes.ClassicSolo, defaultBestTimes2);
        const topTime = await dataBaseService.getTopTimesGameById(id, GameModes.ClassicSolo);
        expect(JSON.stringify(topTime)).toEqual(JSON.stringify(defaultBestTimes2));
        expect(dataBaseService['rebuildGameCarousel']).toBeCalled();
    });

    it('updateTopTimesGameById() should fail if mongo query failed', async () => {
        gameCardModel.findByIdAndUpdate().exec = jest.fn().mockRejectedValue('');
        await expect(dataBaseService.updateTopTimesGameById('id', GameModes.ClassicSolo, defaultBestTimes2)).rejects.toBeTruthy();
    });
    it('updateTopTimesGameById() should update the top times of the game as expected (oneVsOneTopTime cas)', async () => {
        const id = (await gameModel.create(newGameInDB))._id.toString();
        dataBaseService['rebuildGameCarousel'] = jest.fn();
        testGameCards[0]._id = id;
        await gameCardModel.create(testGameCards[0]);
        await dataBaseService.updateTopTimesGameById(id, GameModes.ClassicOneVsOne, defaultBestTimes2);
        const topTime = await dataBaseService.getTopTimesGameById(id, GameModes.ClassicOneVsOne);
        expect(JSON.stringify(topTime)).toEqual(JSON.stringify(defaultBestTimes2));
        expect(dataBaseService['rebuildGameCarousel']).toBeCalled();
    });

    it('rebuildGameCarousel() should rebuild the game carousel', async () => {
        const rebuildGameCarouselSpy = jest.spyOn(listsManagerService, 'buildGameCarousel');
        await dataBaseService['rebuildGameCarousel']();
        expect(rebuildGameCarouselSpy).toBeCalled();
    });

    it('populateDbWithGameConstants should populate the db with the game constants', async () => {
        const gameConstantsModelCreateSpy = jest.spyOn(gameConstantsModel, 'create');
        await dataBaseService['populateDbWithGameConstants']();
        expect(gameConstantsModelCreateSpy).toBeCalled();
    });

    it('populateDbWithGameConstants should fail if mongo query failed', async () => {
        gameConstantsModel.exists = jest.fn().mockRejectedValue('');
        await expect(dataBaseService['populateDbWithGameConstants']()).rejects.toBeTruthy();
    });

    it('populateDbWithGameConstants should not populate the db with the game constants if they already exist', async () => {
        const gameConstantsModelCreateSpy = jest.spyOn(gameConstantsModel, 'create');
        gameConstantsModel.exists = jest.fn().mockResolvedValue(true);
        await dataBaseService['populateDbWithGameConstants']();
        expect(gameConstantsModelCreateSpy).toBeCalledTimes(0);
    });
    it('updateGameConstants should fail if mongo query failed', async () => {
        jest.spyOn(gameConstantsModel, 'replaceOne').mockImplementation(() => {
            throw new Error('Mock MongoDB error');
        });
        await expect(dataBaseService.updateGameConstants({} as GameConstantsDto)).rejects.toBeTruthy();
    });

    it('updateGameConstants should update the game constants', async () => {
        const findOneAndUpdateSpy = jest.spyOn(gameConstantsModel, 'replaceOne');
        await dataBaseService.updateGameConstants(gameConfigConstTest);
        expect(findOneAndUpdateSpy).toBeCalledTimes(1);
    });

    it('resetTopTimesGameById should reset the top times of the game', async () => {
        const id = (await gameModel.create(newGameInDB))._id.toString();
        dataBaseService['rebuildGameCarousel'] = jest.fn();
        testGameCards[0]._id = id;
        await gameCardModel.create(testGameCards[0]);
        await dataBaseService.updateTopTimesGameById(id, GameModes.ClassicSolo, defaultBestTimes2);
        await dataBaseService.resetTopTimesGameById(id);
        const topTime = await dataBaseService.getTopTimesGameById(id, GameModes.ClassicSolo);
        expect(JSON.stringify(topTime)).toEqual(JSON.stringify(defaultBestTimes));
        expect(dataBaseService['rebuildGameCarousel']).toBeCalledTimes(2);
    });

    it('resetTopTimesGameById should fail if mongo query failed', async () => {
        gameCardModel.findByIdAndUpdate().exec = jest.fn().mockRejectedValue('');
        await expect(dataBaseService.resetTopTimesGameById('id')).rejects.toBeTruthy();
    });

    it('resetAllTopTimes should reset all the top times of the games', async () => {
        const id = (await gameModel.create(newGameInDB))._id.toString();
        dataBaseService['rebuildGameCarousel'] = jest.fn();
        testGameCards[0]._id = id;
        await gameCardModel.create(testGameCards[0]);
        await dataBaseService.updateTopTimesGameById(id, GameModes.ClassicSolo, defaultBestTimes2);
        await dataBaseService.resetAllTopTimes();
        const topTime = await dataBaseService.getTopTimesGameById(id, GameModes.ClassicSolo);
        expect(JSON.stringify(topTime)).toEqual(JSON.stringify(defaultBestTimes));
        expect(dataBaseService['rebuildGameCarousel']).toBeCalledTimes(2);
    });

    it('resetAllTopTimes should fail if mongo query failed', async () => {
        jest.spyOn(gameCardModel, 'updateMany').mockImplementation(() => {
            throw new Error('Mock MongoDB error');
        });
        await expect(dataBaseService.resetAllTopTimes()).rejects.toBeTruthy();
    });

    it('getAllGameIds should return all the game ids', async () => {
        const findSpy = jest.spyOn(gameCardModel, 'find');
        const id = (await gameModel.create(newGameInDB))._id.toString();
        const id2 = (await gameModel.create(newGameInDB))._id.toString();
        testGameCards[0]._id = id;
        await gameCardModel.create(testGameCards[0]);
        testGameCards[0]._id = id2;
        await gameCardModel.create(testGameCards[0]);
        await dataBaseService['getAllGameIds']();
        expect(dataBaseService['gameIds']).toEqual([id, id2]);
        expect(findSpy).toBeCalledTimes(1);
    });

    it('getAllGameIds should fail if mongo query failed', async () => {
        jest.spyOn(gameCardModel, 'find').mockImplementation(() => {
            throw new Error('Mock MongoDB error');
        });
        await expect(dataBaseService['getAllGameIds']()).rejects.toBeTruthy();
    });

    it('getRandomGame should return a random game', async () => {
        const id = (await gameModel.create(newGameInDB))._id.toString();
        const id2 = (await gameModel.create(newGameInDB))._id.toString();
        testGameCards[0]._id = id;
        dataBaseService['gameIds'] = [id, id2];
        await gameCardModel.create(testGameCards[0]);
        testGameCards[0]._id = id2;
        await gameCardModel.create(testGameCards[0]);
        const randomGame = await dataBaseService.getRandomGame([id2]);
        expect(randomGame).toBeDefined();
    });

    it('getRandomGame should return undefined if there is no game to return', async () => {
        const id = (await gameModel.create(newGameInDB))._id.toString();
        const id2 = (await gameModel.create(newGameInDB))._id.toString();
        testGameCards[0]._id = id;
        dataBaseService['gameIds'] = [id, id2];
        await gameCardModel.create(testGameCards[0]);
        testGameCards[0]._id = id2;
        await gameCardModel.create(testGameCards[0]);
        const randomGame = await dataBaseService.getRandomGame([id, id2]);
        expect(randomGame).toBeNull();
    });

    it('getRandomGame should fail if mongo query failed', async () => {
        jest.spyOn(dataBaseService, 'getGameById').mockRejectedValue('');
        await expect(dataBaseService.getRandomGame([])).rejects.toBeTruthy();
    });

    it('getGameById should return the game', async () => {
        const id = (await gameModel.create(newGameInDB))._id.toString();
        const game = await dataBaseService.getGameById(id);
        expect(game).toBeDefined();
    });

    it('getGamesHistory should return the games history', async () => {
        await gameHistoryModel.create(gameHistoryTest);
        const gamesHistory = await dataBaseService.getGamesHistory();
        expect(gamesHistory).toBeDefined();
    });

    it('getGamesHistory should fail if mongo query failed', async () => {
        jest.spyOn(gameHistoryModel, 'find').mockImplementation(() => {
            throw new Error('Mock MongoDB error');
        });
        await expect(dataBaseService.getGamesHistory()).rejects.toBeTruthy();
    });

    it('saveGameHistory should save the game history', async () => {
        const createSpy = jest.spyOn(gameHistoryModel, 'create');
        await dataBaseService.saveGameHistory(gameHistoryTest);
        expect(createSpy).toBeCalledTimes(1);
    });

    it('saveGameHistory should fail if mongo query failed', async () => {
        jest.spyOn(gameHistoryModel, 'create').mockImplementation(() => {
            throw new Error('Mock MongoDB error');
        });
        await expect(dataBaseService.saveGameHistory(gameHistoryTest)).rejects.toBeTruthy();
    });

    it('deleteAllGamesHistory should delete all the games history', async () => {
        const deleteManySpy = jest.spyOn(gameHistoryModel, 'deleteMany');
        await dataBaseService.deleteAllGamesHistory();
        expect(deleteManySpy).toBeCalledTimes(1);
    });

    it('deleteAllGamesHistory should fail if mongo query failed', async () => {
        jest.spyOn(gameHistoryModel, 'deleteMany').mockImplementation(() => {
            throw new Error('Mock MongoDB error');
        });
        await expect(dataBaseService.deleteAllGamesHistory()).rejects.toBeTruthy();
    });

    afterAll(() => {
        const dirName = `assets/${testGames[0].name}`;
        if (fs.existsSync(dirName)) {
            fs.unlinkSync(`assets/${testGames[0].name}/original.bmp`);
            fs.unlinkSync(`assets/${testGames[0].name}/modified.bmp`);
            fs.unlinkSync(`assets/${testGames[0].name}/differences.json`);
            fs.rmdirSync('assets/test/');
        }
    });
});
