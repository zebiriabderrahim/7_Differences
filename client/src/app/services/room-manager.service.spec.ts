import { TestBed } from '@angular/core/testing';

import { RoomManagerService } from './room-manager.service';

describe('RoomServiceService', () => {
    let service: RoomManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(RoomManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
