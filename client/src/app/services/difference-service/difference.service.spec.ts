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

    it('isCoordInDifferencesArray should return true if the point is in differencesArray', () => {
        service.differencesArray = [
            { x: 100, y: 200 },
            { x: 300, y: 400 },
        ];
        const point = { x: 100, y: 200 };
        expect(service.isCoordInDifferencesArray(point)).toBe(true);
    });

    it('isCoordInDifferencesArray should return false if the point is not in differencesArray', () => {
        service.differencesArray = [
            { x: 100, y: 200 },
            { x: 300, y: 400 },
        ];
        const point = { x: 500, y: 600 };
        expect(service.isCoordInDifferencesArray(point)).toBe(false);
    });

    it('findAdjacentCoords should return the correct list of adjacent coordinates', () => {
        const coord = { x: 1, y: 1 };
        const expectedAdjacentCoords = [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 1, y: 2 },
            { x: 2, y: 0 },
            { x: 2, y: 1 },
            { x: 2, y: 2 },
        ];
        expect(service.findAdjacentCoords(coord)).toEqual(expectedAdjacentCoords);
    });
});
