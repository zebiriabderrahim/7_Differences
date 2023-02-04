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

    it('isCoordinateValid should return true if the coordinate is valid', () => {
        const coordinate = { x: 300, y: 200 };
        expect(service.isCoordinateValid(coordinate)).toBe(true);
    });

    it('isCoordinateValid should return false if the x coordinate is negative', () => {
        const coordinate = { x: -100, y: 200 };
        expect(service.isCoordinateValid(coordinate)).toBe(false);
    });

    it('isCoordinateValid should return false if the x coordinate is greater than or equal to 640', () => {
        const coordinate = { x: 640, y: 200 };
        expect(service.isCoordinateValid(coordinate)).toBe(false);
    });

    it('isCoordinateValid should return false if the y coordinate is negative', () => {
        const coordinate = { x: 300, y: -100 };
        expect(service.isCoordinateValid(coordinate)).toBe(false);
    });

    it('isCoordinateValid should return false if the y coordinate is greater than or equal to 480', () => {
        const coordinate = { x: 300, y: 480 };
        expect(service.isCoordinateValid(coordinate)).toBe(false);
    });
});
