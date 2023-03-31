import { Test, TestingModule } from '@nestjs/testing';
import { LimitedModeService } from './limited-mode.service';

describe('LimitedModeService', () => {
  let service: LimitedModeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LimitedModeService],
    }).compile();

    service = module.get<LimitedModeService>(LimitedModeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
