import { TestBed } from '@angular/core/testing';

import { HintService } from './hint.service';

describe('HintService', () => {
    let service: HintService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(HintService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
