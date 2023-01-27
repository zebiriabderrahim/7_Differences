import { TestBed } from '@angular/core/testing';

import { GameAreaService } from './game-area.service';

describe('GameAreaService', () => {
  let service: GameAreaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameAreaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
