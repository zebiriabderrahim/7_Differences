import { TestBed } from '@angular/core/testing';

import { ClassicSystemService } from './classic-system.service';

describe('ClassicSystemService', () => {
    let service: ClassicSystemService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ClassicSystemService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
