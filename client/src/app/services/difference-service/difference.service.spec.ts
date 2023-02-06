/* eslint-disable max-lines */
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

    it('setDifferencesArray should set the differencesArray', () => {
        const differencesArray = [
            { x: 300, y: 200 },
            { x: 400, y: 300 },
        ];
        service.setDifferencesArray(differencesArray);
        expect(service.differencesArray).toBe(differencesArray);
    });

    it('isCoordinateValid should return true if the coordinate is valid', () => {
        const coordinate = { x: 300, y: 200 };
        expect(service.isCoordinateValid(coordinate)).toBeTruthy();
    });

    it('isCoordinateValid should return false if the x coordinate is negative', () => {
        const coordinate = { x: -100, y: 200 };
        expect(service.isCoordinateValid(coordinate)).toBeFalsy();
    });

    it('isCoordinateValid should return false if the x coordinate is greater than or equal to 640', () => {
        const coordinate = { x: 640, y: 200 };
        expect(service.isCoordinateValid(coordinate)).toBeFalsy();
    });

    it('isCoordinateValid should return false if the y coordinate is negative', () => {
        const coordinate = { x: 300, y: -100 };
        expect(service.isCoordinateValid(coordinate)).toBeFalsy();
    });

    it('isCoordinateValid should return false if the y coordinate is greater than or equal to 480', () => {
        const coordinate = { x: 300, y: 480 };
        expect(service.isCoordinateValid(coordinate)).toBeFalsy();
    });

    it('isCoordInDifferencesArray should return true if the point is in differencesArray', () => {
        service.differencesArray = [
            { x: 100, y: 200 },
            { x: 300, y: 400 },
        ];
        const point = { x: 100, y: 200 };
        expect(service.isCoordInDifferencesArray(point)).toBeTruthy();
    });

    it('isCoordInDifferencesArray should return false if the point is not in differencesArray', () => {
        service.differencesArray = [
            { x: 100, y: 200 },
            { x: 300, y: 400 },
        ];
        const point = { x: 500, y: 600 };
        expect(service.isCoordInDifferencesArray(point)).toBeFalsy();
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

    it('generateDifferencesPackages should return differences grouped by proximity', () => {
        const differencesArray = [
            { x: 69, y: 0 },
            { x: 70, y: 0 },
            { x: 0, y: 39 },
            { x: 0, y: 40 },
        ];
        const expectedDifferencesPackages = [
            [
                { x: 69, y: 0 },
                { x: 70, y: 0 },
            ],
            [
                { x: 0, y: 39 },
                { x: 0, y: 40 },
            ],
        ];
        service.setDifferencesArray(differencesArray);
        expect(service.generateDifferencesPackages()).toEqual(expectedDifferencesPackages);
    });

    it('generateDifferences should return differences of pixels', () => {
        const originalPixelArray = [
            { red: 100, green: 200, blue: 150, alpha: 0 },
            { red: 50, green: 100, blue: 200, alpha: 1 },
        ];
        const modifiedPixelArray = [
            { red: 40, green: 200, blue: 150, alpha: 0 },
            { red: 50, green: 100, blue: 200, alpha: 1 },
        ];
        const expectDifferences = [{ x: 0, y: 0 }];
        const radius = 0;
        expect(service.generateDifferences(originalPixelArray, modifiedPixelArray, radius)).toEqual(expectDifferences);
    });

    it('enlargeDifferences should enlarge differences according to radius', () => {
        const differences = [
            { x: 100, y: 200 },
            { x: 300, y: 400 },
        ];
        const enlargedDifferences = [
            { x: 99, y: 200 },
            { x: 100, y: 199 },
            { x: 100, y: 200 },
            { x: 100, y: 201 },
            { x: 101, y: 200 },
            { x: 299, y: 400 },
            { x: 300, y: 399 },
            { x: 300, y: 400 },
            { x: 300, y: 401 },
            { x: 301, y: 400 },
        ];
        const radius = 1;
        expect(service.enlargeDifferences(differences, radius)).toEqual(enlargedDifferences);
    });

    it('enlargeDifferences should not change differences if radius is zero', () => {
        const differencesArray = [
            { x: 100, y: 200 },
            { x: 300, y: 400 },
        ];
        const radius = 0;
        expect(service.enlargeDifferences(differencesArray, radius)).toEqual(differencesArray);
    });

    it('arePixelsDifferent should return true if the two pixels have different values', () => {
        const pixel1 = { red: 100, green: 200, blue: 150, alpha: 0 };
        const pixel2 = { red: 50, green: 100, blue: 200, alpha: 1 };
        expect(service.arePixelsDifferent(pixel1, pixel2)).toBeTruthy();
    });

    it('arePixelsDifferent should return false if the two pixels have the same values', () => {
        const pixel1 = { red: 100, green: 200, blue: 150, alpha: 0 };
        const pixel2 = { red: 100, green: 200, blue: 150, alpha: 1 };
        expect(service.arePixelsDifferent(pixel1, pixel2)).toBeFalsy();
    });

    it('isNumberOfDifferencesValid should return true if the number of differences is between 3 and 9 inclusive', () => {
        service.differencePackages = [
            [
                { x: 10, y: 20 },
                { x: 30, y: 40 },
            ],
            [
                { x: 50, y: 60 },
                { x: 70, y: 80 },
            ],
            [
                { x: 90, y: 100 },
                { x: 110, y: 120 },
            ],
        ];
        expect(service.isNumberOfDifferencesValid()).toBeTruthy();
    });

    it('isNumberOfDifferencesValid should return false if the number of differences is less than 3', () => {
        service.differencePackages = [
            [
                { x: 10, y: 20 },
                { x: 30, y: 40 },
            ],
            [
                { x: 50, y: 60 },
                { x: 70, y: 80 },
            ],
        ];
        expect(service.isNumberOfDifferencesValid()).toBeFalsy();
    });

    it('isNumberOfDifferencesValid should return false if the number of differences is greater than 9', () => {
        service.differencePackages = [
            [
                { x: 10, y: 20 },
                { x: 30, y: 40 },
            ],
            [
                { x: 50, y: 60 },
                { x: 70, y: 80 },
            ],
            [
                { x: 90, y: 100 },
                { x: 110, y: 120 },
            ],
            [
                { x: 130, y: 140 },
                { x: 150, y: 160 },
            ],
            [
                { x: 170, y: 180 },
                { x: 190, y: 200 },
            ],
            [
                { x: 210, y: 220 },
                { x: 230, y: 240 },
            ],
            [
                { x: 250, y: 260 },
                { x: 270, y: 280 },
            ],
            [
                { x: 290, y: 300 },
                { x: 310, y: 320 },
            ],
            [
                { x: 330, y: 340 },
                { x: 350, y: 360 },
            ],
            [
                { x: 370, y: 380 },
                { x: 390, y: 400 },
            ],
        ];
        expect(service.isNumberOfDifferencesValid()).toBeFalsy();
    });

    // eslint-disable-next-line max-len
    it('isGameHard returns true if differencePackages has N_DIFFERENCES_HARD_GAME = 7 or more elements and differencesPercentage is less than or equal to HARD_DIFFERENCES_PERCENTAGE = 0.15', () => {
        service.differencesArray = [
            { x: 1, y: 1 },
            { x: 1, y: 4 },
        ];
        service.differencePackages = [
            [
                { x: 1, y: 1 },
                { x: 2, y: 2 },
            ],
            [
                { x: 3, y: 3 },
                { x: 4, y: 4 },
            ],
            [
                { x: 3, y: 3 },
                { x: 4, y: 4 },
            ],
            [
                { x: 3, y: 3 },
                { x: 4, y: 4 },
            ],
            [
                { x: 3, y: 3 },
                { x: 4, y: 4 },
            ],
            [
                { x: 3, y: 3 },
                { x: 4, y: 4 },
            ],
            [
                { x: 3, y: 3 },
                { x: 4, y: 4 },
            ],
        ];
        expect(service.isGameHard()).toBeTruthy();
    });

    it('isGameHard returns false if differencePackages has less than N_DIFFERENCES_HARD_GAME = 7 elements', () => {
        service.differencesArray = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        service.differencePackages = [
            [
                { x: 1, y: 1 },
                { x: 2, y: 2 },
            ],
            [
                { x: 3, y: 3 },
                { x: 4, y: 4 },
            ],
            [{ x: 5, y: 5 }],
        ];
        expect(service.isGameHard()).toBeFalsy();
    });

    it('isGameHard returns false if differencesPercentage is greater than HARD_DIFFERENCES_PERCENTAGE = 0.15', () => {
        service.differencesArray = [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
            { x: 4, y: 4 },
            { x: 5, y: 5 },
            { x: 6, y: 6 },
            { x: 7, y: 7 },
            { x: 8, y: 8 },
            { x: 9, y: 9 },
            { x: 10, y: 10 },
        ];
        service.differencePackages = [
            [
                { x: 1, y: 1 },
                { x: 2, y: 2 },
            ],
            [
                { x: 3, y: 3 },
                { x: 4, y: 4 },
            ],
            [
                { x: 5, y: 5 },
                { x: 6, y: 6 },
            ],
            [
                { x: 7, y: 7 },
                { x: 8, y: 8 },
            ],
            [
                { x: 9, y: 9 },
                { x: 10, y: 10 },
            ],
        ];
        expect(service.isGameHard()).toBeFalsy();
    });
});
