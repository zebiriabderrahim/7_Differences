import { TestBed } from '@angular/core/testing';

import { ClientSocketService } from './client-socket.service';

describe('ClientSocketService', () => {
  let service: ClientSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
