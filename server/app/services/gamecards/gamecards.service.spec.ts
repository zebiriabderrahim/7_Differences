import { Test, TestingModule } from '@nestjs/testing';
import { GamecardsService } from './gamecards.service';

describe('GamecardsService', () => {
  let service: GamecardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GamecardsService],
    }).compile();

    service = module.get<GamecardsService>(GamecardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
