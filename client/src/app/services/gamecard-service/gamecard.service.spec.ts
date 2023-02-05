import { TestBed } from '@angular/core/testing';

import { GameCardService } from './gamecard.service';

describe('GamecardService', () => {
    let service: GameCardService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameCardService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
