import { TestBed } from '@angular/core/testing';

import { CaptureService } from './capture.service';

describe('CaptureService', () => {
    let service: CaptureService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CaptureService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
