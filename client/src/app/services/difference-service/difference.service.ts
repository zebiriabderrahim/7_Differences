import { Injectable } from '@angular/core';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/creation-page';
import { Vec2 } from '@app/interfaces/vec2';
import { ImageService } from '@app/services/image-service/image.service';

@Injectable({
    providedIn: 'root',
})
export class DifferenceService {
    differencesArray: Vec2[] = []; // TODO link to appropriate service
    differencesCounter: number = this.differencesArray.length;

    constructor(public imageService: ImageService) {}

    isCoordInImage(x: number, y: number): boolean {
        return x >= 0 && x < IMG_WIDTH && y >= 0 && y < IMG_HEIGHT;
    }

    isCoordInDifferencesArr(point: Vec2): boolean {
        for (const coord of this.differencesArray) {
            if (coord.x === point.x && coord.y === point.y) {
                return true;
            }
        }
        return false;
    }

    findAdjacentCoords(coord: Vec2): Vec2[] {
        const adjacentCoords: Vec2[] = [];
        for (let x = coord.x - 1; x <= coord.x + 1; x++) {
            for (let y = coord.y - 1; y <= coord.y + 1; y++) {
                if (this.isCoordInImage(x, y)) {
                    adjacentCoords.push({ x, y });
                }
            }
        }
        return adjacentCoords;
    }

    sortDifferences(): Vec2[][] {
        const differences: Vec2[][] = [];
        const visitedCoords: boolean[][] = new Array(IMG_WIDTH).fill(false).map(() => new Array(IMG_HEIGHT).fill(false)) as boolean[][];
        let queue: Vec2[] = [];
        let currentDifference: Vec2[] = [];
        let activeDifference: Vec2;
        for (const differenceCoordinate of this.differencesArray) {
            queue = [];
            currentDifference = [];
            if (!visitedCoords[differenceCoordinate.x][differenceCoordinate.y]) {
                currentDifference.push(differenceCoordinate);
                visitedCoords[differenceCoordinate.x][differenceCoordinate.y] = true;
                queue.push(differenceCoordinate);
            }
            while (queue.length !== 0) {
                activeDifference = queue.pop() as Vec2;
                for (const coord of this.findAdjacentCoords(activeDifference as Vec2)) {
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
        return differences;
    }
}
