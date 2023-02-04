import { Test, TestingModule } from '@nestjs/testing';
import { ClassicSoloModeService } from './classic-solo-mode.service';

describe('ClassicSoloModeService', () => {
  let service: ClassicSoloModeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClassicSoloModeService],
    }).compile();

    service = module.get<ClassicSoloModeService>(ClassicSoloModeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
