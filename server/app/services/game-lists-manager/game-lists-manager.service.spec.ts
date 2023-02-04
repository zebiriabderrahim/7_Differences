import { Test, TestingModule } from '@nestjs/testing';
import { GameListsManagerService } from './game-lists-manager.service';

describe('GameListsManagerService', () => {
  let service: GameListsManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameListsManagerService],
    }).compile();

    service = module.get<GameListsManagerService>(GameListsManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
