import { TestBed } from '@angular/core/testing';

import { CommunicationServiceService } from './communication-service.service';

describe('CommunicationServiceService', () => {
  let service: CommunicationServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommunicationServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
