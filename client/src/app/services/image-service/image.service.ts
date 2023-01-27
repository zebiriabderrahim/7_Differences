import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ImageService {
    originalImage: HTMLImageElement = new Image();
    modifiedImage: HTMLImageElement = new Image();
    resetBothCanvas() {
        this.originalImage = new Image();
        this.modifiedImage = new Image();
    }
}
