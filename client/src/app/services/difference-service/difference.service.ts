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
}
