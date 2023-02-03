import { Injectable } from '@angular/core';
import { DEFAULT_RADIUS, IMG_HEIGHT, IMG_WIDTH, MAX_N_DIFFERENCES, MIN_N_DIFFERENCES } from '@app/constants/creation-page';
import { Coordinate } from '@app/interfaces/coordinate';
import { Pixel } from '@app/interfaces/pixel';

@Injectable({
    providedIn: 'root',
})
export class DifferenceService {
    differencesArray: Coordinate[] = []; // TODO link to appropriate service
    differencePackages: Coordinate[][] = [];
    enlargementRadius: number = DEFAULT_RADIUS;

    setEnlargementRadius(radius: number) {
        this.enlargementRadius = radius;
    }

    setDifferencesArray(differencesArray: Coordinate[]) {
        this.differencesArray = differencesArray;
    }

    isCoordinateValid(coordinate: Coordinate): boolean {
        return coordinate.x >= 0 && coordinate.x < IMG_WIDTH && coordinate.y >= 0 && coordinate.y < IMG_HEIGHT;
    }

    isCoordInDifferencesArr(point: Coordinate): boolean {
        for (const coord of this.differencesArray) {
            if (coord.x === point.x && coord.y === point.y) {
                return true;
            }
        }
        return false;
    }

    findAdjacentCoords(coord: Coordinate): Coordinate[] {
        const adjacentCoords: Coordinate[] = [];
        for (let x = coord.x - 1; x <= coord.x + 1; x++) {
            for (let y = coord.y - 1; y <= coord.y + 1; y++) {
                if (this.isCoordinateValid({ x, y })) {
                    adjacentCoords.push({ x, y });
                }
            }
        }
        return adjacentCoords;
    }

    // sortDifferences(): Coordinate[][] {
    sortDifferences(): void {
        const differences: Coordinate[][] = [];
        const visitedCoords: boolean[][] = new Array(IMG_WIDTH).fill(false).map(() => new Array(IMG_HEIGHT).fill(false)) as boolean[][];
        let queue: Coordinate[] = [];
        let currentDifference: Coordinate[] = [];
        let activeDifference: Coordinate;
        for (const differenceCoordinate of this.differencesArray) {
            queue = [];
            currentDifference = [];
            if (!visitedCoords[differenceCoordinate.x][differenceCoordinate.y]) {
                currentDifference.push(differenceCoordinate);
                visitedCoords[differenceCoordinate.x][differenceCoordinate.y] = true;
                queue.push(differenceCoordinate);
            }
            while (queue.length !== 0) {
                activeDifference = queue.pop() as Coordinate;
                for (const coord of this.findAdjacentCoords(activeDifference as Coordinate)) {
                    if (!visitedCoords[coord.x][coord.y] && this.isCoordInDifferencesArr(coord)) {
                        visitedCoords[coord.x][coord.y] = true;
                        currentDifference.push(coord);
                        queue.push(coord);
                    }
                }
            }
            if (currentDifference.length !== 0) {
                differences.push(currentDifference);
            }
        }
        this.differencePackages = differences;
        // this.differencesCounter = differences.length;
        // return differences;
    }

    generateDifferences(pixelArray1: Pixel[], pixelArray2: Pixel[]): Coordinate[] {
        const differentCoordinates: Coordinate[] = [];
        for (let i = 0; i < pixelArray1.length; i++) {
            if (this.arePixelsDifferent(pixelArray1[i], pixelArray2[i])) {
                const x = i % IMG_WIDTH;
                const y = Math.floor(i / IMG_WIDTH);
                differentCoordinates.push({ x, y });
            }
        }
        this.differencesArray = this.enlargeDifferences(differentCoordinates);
        this.sortDifferences();
        return this.differencesArray;
    }

    arePixelsDifferent(pixel1: Pixel, pixel2: Pixel): boolean {
        return !(pixel1.red === pixel2.red && pixel1.green === pixel2.green && pixel1.blue === pixel2.blue);
    }

    enlargeDifferences(differenceCoordinates: Coordinate[]): Coordinate[] {
        const visitedDifferences: boolean[][] = new Array(IMG_WIDTH).fill(false).map(() => new Array(IMG_HEIGHT).fill(false)) as boolean[][];
        const enlargedDifferenceCoordinates: Coordinate[] = [];
        for (const coordinate of differenceCoordinates) {
            for (let i = -this.enlargementRadius; i <= this.enlargementRadius; i++) {
                for (let j = -this.enlargementRadius; j <= this.enlargementRadius; j++) {
                    const distance = Math.sqrt(i * i + j * j);
                    if (distance <= this.enlargementRadius) {
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
        const nDifferences = this.differencePackages.length;
        return nDifferences >= MIN_N_DIFFERENCES && nDifferences <= MAX_N_DIFFERENCES;
    }
}
