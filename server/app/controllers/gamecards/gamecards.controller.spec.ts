import { Test, TestingModule } from '@nestjs/testing';
import { GamecardsController } from './gamecards.controller';

describe('GamecardsController', () => {
  let controller: GamecardsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamecardsController],
    }).compile();

    controller = module.get<GamecardsController>(GamecardsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
