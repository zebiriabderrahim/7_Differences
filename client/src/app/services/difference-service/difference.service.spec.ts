import { TestBed } from '@angular/core/testing';

import { DifferenceService } from './difference.service';

describe('DifferenceService', () => {
    let service: DifferenceService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DifferenceService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
