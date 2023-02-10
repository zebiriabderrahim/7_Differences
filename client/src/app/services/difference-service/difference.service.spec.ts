/* eslint-disable max-lines */
import { TestBed } from '@angular/core/testing';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/creation-page';
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

    // it('setDifferencesArray should set the differencesArray', () => {
    //     const differencesArray = [
    //         { x: 300, y: 200 },
    //         { x: 400, y: 300 },
    //     ];
    //     service.setDifferencesArray(differencesArray);
    //     expect(service.differencesArray).toBe(differencesArray);
    // });

    it('resetAttributes should reset the attributes', () => {
        const difference = { x: 300, y: 200 };
        service.differences = [difference];
        service.differencePackages = [[difference]];
        service.visitedCoordinates = [[true]];
        service.differenceMatrix = [[true]];
        service.resetAttributes();
        expect(service.differences).toEqual([]);
        expect(service.differencePackages).toEqual([]);
        expect(service.visitedCoordinates).toEqual(service.createFalseMatrix(IMG_WIDTH, IMG_HEIGHT));
        expect(service.differenceMatrix).toEqual(service.createFalseMatrix(IMG_WIDTH, IMG_HEIGHT));
    });

    it('createFalseMatrix should create a matrix of false values to specific sizes', () => {
        const matrix = [
            [false, false],
            [false, false],
            [false, false],
        ];
        expect(service.createFalseMatrix(matrix.length, matrix[0].length)).toEqual(matrix);
    });

    it('isCoordinateValid should return true if the coordinate is valid', () => {
        const coordinate = { x: 300, y: 200 };
        expect(service.isCoordinateValid(coordinate)).toBeTruthy();
    });

    it('isCoordinateValid should return false if the x coordinate is negative', () => {
        const coordinate = { x: -100, y: 200 };
        expect(service.isCoordinateValid(coordinate)).toBeFalsy();
    });

    it('isCoordinateValid should return false if the x coordinate is greater than or equal to Image width', () => {
        const coordinate = { x: IMG_WIDTH + 2, y: 200 };
        expect(service.isCoordinateValid(coordinate)).toBeFalsy();
    });

    it('isCoordinateValid should return false if the y coordinate is negative', () => {
        const coordinate = { x: 300, y: -100 };
        expect(service.isCoordinateValid(coordinate)).toBeFalsy();
    });

    it('isCoordinateValid should return false if the y coordinate is greater than or equal to image height', () => {
        const coordinate = { x: 300, y: IMG_HEIGHT + 2 };
        expect(service.isCoordinateValid(coordinate)).toBeFalsy();
    });

    it('findAdjacentCoords should return the correct list of adjacent coordinates', () => {
        const coord = { x: 1, y: 1 };
        const expectedAdjacentCoords = [
            { x: coord.x - 1, y: coord.y - 1 },
            { x: coord.x - 1, y: coord.y },
            { x: coord.x - 1, y: coord.y + 1 },
            { x: coord.x, y: coord.y - 1 },
            { x: coord.x, y: coord.y + 1 },
            { x: coord.x + 1, y: coord.y - 1 },
            { x: coord.x + 1, y: coord.y },
            { x: coord.x + 1, y: coord.y + 1 },
        ];
        expect(service.findAdjacentCoords(coord)).toEqual(expectedAdjacentCoords);
    });

    it('generateDifferencesPackages should return differences grouped by proximity', () => {
        service.differences = [
            { x: 69, y: 0 },
            { x: 70, y: 0 },
            { x: 0, y: 39 },
            { x: 0, y: 40 },
        ];

        service.differenceMatrix = service.createFalseMatrix(IMG_WIDTH, IMG_HEIGHT);
        service.differenceMatrix[69][0] = true;
        service.differenceMatrix[70][0] = true;
        service.differenceMatrix[0][39] = true;
        service.differenceMatrix[0][40] = true;

        const expectedDifferencesPackages = [
            [
                { x: 0, y: 39 },
                { x: 0, y: 40 },
            ],
            [
                { x: 69, y: 0 },
                { x: 70, y: 0 },
            ],
        ];
        expect(service.generateDifferencesPackages()).toEqual(expectedDifferencesPackages);
    });

    it('breadthFirstSearch should return only the difference if it has no surrounding differences', () => {
        const difference = { x: 100, y: 100 };
        expect(service.breadthFirstSearch(difference)).toEqual([difference]);
    });

    it('breadthFirstSearch should return difference and it connected differences', () => {
        const difference = { x: 100, y: 100 };
        const connectedDifferences = [difference, { x: 100, y: 101 }, { x: 100, y: 102 }, { x: 101, y: 103 }];
        service.differenceMatrix = service.createFalseMatrix(IMG_WIDTH, IMG_HEIGHT);
        service.differenceMatrix[difference.x][difference.y] = true;
        connectedDifferences.forEach((connectedDifference) => {
            service.differenceMatrix[connectedDifference.x][connectedDifference.y] = true;
        });
        expect(service.breadthFirstSearch(difference)).toEqual(connectedDifferences);
    });

    it('generateDifferences should return differences of pixels', () => {
        const gamesPixels = {
            leftImage: [
                { red: 100, green: 200, blue: 150, alpha: 0 },
                { red: 50, green: 100, blue: 200, alpha: 1 },
            ],
            rightImage: [
                { red: 40, green: 200, blue: 150, alpha: 0 },
                { red: 50, green: 100, blue: 200, alpha: 1 },
            ],
        };
        const expectDifferences = [{ x: 0, y: 0 }];
        const radius = 0;
        expect(service.generateDifferences(gamesPixels, radius)).toEqual(expectDifferences);
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
            [{ x: 10, y: 20 }],
            [{ x: 20, y: 20 }],
            [{ x: 30, y: 20 }],
            [{ x: 40, y: 20 }],
            [{ x: 50, y: 20 }],
            [{ x: 60, y: 20 }],
            [{ x: 70, y: 20 }],
            [{ x: 80, y: 20 }],
            [{ x: 90, y: 20 }],
            [{ x: 100, y: 20 }],
        ];
        expect(service.isNumberOfDifferencesValid()).toBeFalsy();
    });

    // it('isGameHard returns true if differencePackages has N_DIFFERENCES_HARD_GAME = 7 or more elements
    // and differencesPercentage is less than or equal to HARD_DIFFERENCES_PERCENTAGE = 0.15', () => {
    it('isGameHard returns true if differencePackages has 7 differences or more and covers less than 15% of the area', () => {
        service.differences = [
            { x: 10, y: 20 },
            { x: 20, y: 20 },
            { x: 30, y: 20 },
            { x: 40, y: 20 },
            { x: 50, y: 20 },
            { x: 60, y: 20 },
            { x: 70, y: 20 },
            { x: 80, y: 20 },
        ];

        service.differencePackages = [
            [{ x: 10, y: 20 }],
            [{ x: 20, y: 20 }],
            [{ x: 30, y: 20 }],
            [{ x: 40, y: 20 }],
            [{ x: 50, y: 20 }],
            [{ x: 60, y: 20 }],
            [{ x: 70, y: 20 }],
            [{ x: 80, y: 20 }],
        ];
        expect(service.isGameHard()).toBeTruthy();
    });

    // it('isGameHard returns false if differencePackages has less than 7 elements', () => {
    it('isGameHard returns false if differencePackages has less than 7 elements', () => {
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
        service.differences = new Array(IMG_HEIGHT * IMG_WIDTH).fill({ x: 0, y: 0 });
        service.differencePackages = [
            [{ x: 10, y: 20 }],
            [{ x: 20, y: 20 }],
            [{ x: 30, y: 20 }],
            [{ x: 40, y: 20 }],
            [{ x: 50, y: 20 }],
            [{ x: 60, y: 20 }],
            [{ x: 70, y: 20 }],
            [{ x: 80, y: 20 }],
        ];
        expect(service.isGameHard()).toBeFalsy();
    });
});
