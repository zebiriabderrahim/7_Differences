import { TestBed } from '@angular/core/testing';

import { GameListServiceService } from './game-list-service.service';

describe('GameListServiceService', () => {
  let service: GameListServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameListServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
