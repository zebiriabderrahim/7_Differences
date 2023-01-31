import { Test, TestingModule } from '@nestjs/testing';
import { GameListsService } from './game-lists.service';

describe('GameListsService', () => {
  let service: GameListsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameListsService],
    }).compile();

    service = module.get<GameListsService>(GameListsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
