import { TestBed } from '@angular/core/testing';

import { ForegroundService } from './foreground.service';

describe('ForegroundService', () => {
    let service: ForegroundService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ForegroundService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
