import { TestBed } from '@angular/core/testing';

import { ReplayService } from './replay.service';

describe('ReplayService', () => {
  let service: ReplayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReplayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
