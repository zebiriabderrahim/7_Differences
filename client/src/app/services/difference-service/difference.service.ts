import { Injectable } from '@angular/core';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/creation-page';
import { Vec2 } from '@app/interfaces/vec2';
import { ImageService } from '@app/services/image-service/image.service';

@Injectable({
    providedIn: 'root',
})
export class DifferenceService {
    differencesArr: Vec2[] = [];
    differencesCounter: number = this.differencesArr.length;

    constructor(public imageService: ImageService) {}

    isCoordInImage(x: number, y: number): boolean {
        return x >= 0 && x < IMG_WIDTH && y >= 0 && y < IMG_HEIGHT;
    }

    isCoordInDifferencesArr(point: Vec2): boolean {
        for (const coord of this.differencesArr) {
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
}
