import { Injectable } from '@angular/core';
import { CanvasPosition } from '@app/enum/canvas-position';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ImageService {
    originalImageObservable;
    modifiedImageObservable;
    originalImage: string = '';
    modifiedImage: string = '';

    private originalImageSource = new Subject<string>();
    private modifiedImageSource = new Subject<string>();

    constructor() {
        this.originalImageObservable = this.originalImageSource.asObservable();
        this.modifiedImageObservable = this.modifiedImageSource.asObservable();
    }

    removeBackground(canvasPosition: CanvasPosition) {
        switch (canvasPosition) {
            case CanvasPosition.Left:
                this.resetOriginalImage();
                break;
            case CanvasPosition.Right:
                this.resetModifiedImage();
                break;
        }
    }

    resetOriginalImage() {
        this.originalImage = '';
        this.originalImageSource.next(this.originalImage);
    }

    resetModifiedImage() {
        this.modifiedImage = '';
        this.modifiedImageSource.next(this.modifiedImage);
    }

    resetBothCanvas() {
        this.resetOriginalImage();
        this.resetModifiedImage();
    }

    setOriginalImage(image: string) {
        this.originalImage = image;
        this.originalImageSource.next(image);
    }

    setModifiedImage(image: string) {
        this.modifiedImage = image;
        this.modifiedImageSource.next(image);
    }

    setBothCanvas(image: string) {
        this.setOriginalImage(image);
        this.setModifiedImage(image);
    }
}
