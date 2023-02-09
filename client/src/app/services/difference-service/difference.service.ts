import { Injectable } from '@angular/core';
import { HARD_DIFFERENCES_PERCENTAGE, N_DIFFERENCES_HARD_GAME } from '@app/constants/constants';
import { IMG_HEIGHT, IMG_WIDTH, MAX_N_DIFFERENCES, MIN_N_DIFFERENCES } from '@app/constants/creation-page';
import { Coordinate } from '@app/interfaces/coordinate';
import { Pixel } from '@app/interfaces/pixel';

@Injectable({
    providedIn: 'root',
})
export class DifferenceService {
    differencesArray: Coordinate[]; // TODO link to appropriate service
    differencePackages: Coordinate[][];
    visitedCoordinates: boolean[][];
    differenceMatrix: boolean[][];

    constructor() {
        this.differencesArray = [];
        this.differencePackages = [];
        this.visitedCoordinates = this.createFalseMatrix(IMG_WIDTH, IMG_HEIGHT);
        this.differenceMatrix = this.createFalseMatrix(IMG_WIDTH, IMG_HEIGHT);
    }

    resetVisitedCoordinates() {
        this.visitedCoordinates = new Array(IMG_WIDTH).fill(false).map(() => new Array(IMG_HEIGHT).fill(false)) as boolean[][];
    }

    createFalseMatrix(width: number, height: number): boolean[][] {
        return new Array(width).fill(false).map(() => new Array(height).fill(false)) as boolean[][];
    }

    isCoordinateValid(coordinate: Coordinate): boolean {
        return coordinate.x >= 0 && coordinate.x < IMG_WIDTH && coordinate.y >= 0 && coordinate.y < IMG_HEIGHT;
    }

    findAdjacentCoords(coord: Coordinate): Coordinate[] {
        const adjacentCoordinates: Coordinate[] = [
            { x: coord.x - 1, y: coord.y - 1 },
            { x: coord.x - 1, y: coord.y },
            { x: coord.x - 1, y: coord.y + 1 },
            { x: coord.x, y: coord.y - 1 },
            { x: coord.x, y: coord.y + 1 },
            { x: coord.x + 1, y: coord.y - 1 },
            { x: coord.x + 1, y: coord.y },
            { x: coord.x + 1, y: coord.y + 1 },
        ];
        return adjacentCoordinates.filter((coordinate) => this.isCoordinateValid(coordinate));
    }

    generateDifferencesPackages(): Coordinate[][] {
        const differences: Coordinate[][] = [];
        this.resetVisitedCoordinates();
        for (let i = 0; i < IMG_WIDTH; i++) {
            for (let j = 0; j < IMG_HEIGHT; j++) {
                if (!this.visitedCoordinates[i][j] && this.differenceMatrix[i][j]) {
                    differences.push(this.bfs({ x: i, y: j }));
                }
            }
        }
        this.differencePackages = differences;
        return differences;
    }

    bfs(difference: Coordinate): Coordinate[] {
        const queue: Coordinate[] = [];
        const currentDifference: Coordinate[] = [];
        let activeDifference: Coordinate;
        currentDifference.push(difference);
        this.visitedCoordinates[difference.x][difference.y] = true;
        queue.push(difference);
        while (queue.length !== 0) {
            activeDifference = queue.pop() as Coordinate;
            for (const coord of this.findAdjacentCoords(activeDifference as Coordinate)) {
                if (!this.visitedCoordinates[coord.x][coord.y] && this.differenceMatrix[coord.x][coord.y]) {
                    this.visitedCoordinates[coord.x][coord.y] = true;
                    currentDifference.push(coord);
                    queue.push(coord);
                }
            }
        }
        return currentDifference;
    }

    generateDifferences(pixelArray1: Pixel[], pixelArray2: Pixel[], radius: number): Coordinate[] {
        this.differenceMatrix = this.createFalseMatrix(IMG_WIDTH, IMG_HEIGHT);
        const differentCoordinates: Coordinate[] = [];
        for (let i = 0; i < pixelArray1.length; i++) {
            if (this.arePixelsDifferent(pixelArray1[i], pixelArray2[i])) {
                const x = i % IMG_WIDTH;
                const y = Math.floor(i / IMG_WIDTH);
                differentCoordinates.push({ x, y });
                this.differenceMatrix[x][y] = true;
            }
        }
        this.differencesArray = this.enlargeDifferences(differentCoordinates, radius);
        this.generateDifferencesPackages();
        return this.differencesArray;
    }

    arePixelsDifferent(pixel1: Pixel, pixel2: Pixel): boolean {
        return !(pixel1.red === pixel2.red && pixel1.green === pixel2.green && pixel1.blue === pixel2.blue);
    }

    enlargeDifferences(differenceCoordinates: Coordinate[], radius: number): Coordinate[] {
        const visitedDifferences: boolean[][] = new Array(IMG_WIDTH).fill(false).map(() => new Array(IMG_HEIGHT).fill(false)) as boolean[][];
        const enlargedDifferenceCoordinates: Coordinate[] = [];
        for (const coordinate of differenceCoordinates) {
            for (let i = -radius; i <= radius; i++) {
                for (let j = -radius; j <= radius; j++) {
                    const distance = Math.sqrt(i * i + j * j);
                    if (distance <= radius) {
                        const largerCoordinate: Coordinate = { x: coordinate.x + i, y: coordinate.y + j };
                        if (this.isCoordinateValid(largerCoordinate) && !visitedDifferences[largerCoordinate.x][largerCoordinate.y]) {
                            enlargedDifferenceCoordinates.push(largerCoordinate);
                            visitedDifferences[largerCoordinate.x][largerCoordinate.y] = true;
                        }
                    }
                }
            }
        }
        return enlargedDifferenceCoordinates;
    }

    isNumberOfDifferencesValid(): boolean {
        const nDifferences: number = this.differencePackages.length;
        return nDifferences >= MIN_N_DIFFERENCES && nDifferences <= MAX_N_DIFFERENCES;
    }

    isGameHard(): boolean {
        const differencesPercentage = this.differencesArray.length / (IMG_WIDTH * IMG_HEIGHT);
        return this.differencePackages.length >= N_DIFFERENCES_HARD_GAME && differencesPercentage <= HARD_DIFFERENCES_PERCENTAGE;
    }
}
