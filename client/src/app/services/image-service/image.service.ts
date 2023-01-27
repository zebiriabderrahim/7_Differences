import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ImageService {
    private originalImageSource = new Subject<HTMLImageElement>();
    private modifiedImageSource = new Subject<HTMLImageElement>();

    originalImageObservable = this.originalImageSource.asObservable();
    modifiedImageObservable = this.modifiedImageSource.asObservable();

    originalImage: HTMLImageElement = new Image();
    modifiedImage: HTMLImageElement = new Image();

    resetBothCanvas() {
        this.originalImage = new Image();
        this.modifiedImage = new Image();
    }
    setBothCanvas(image: HTMLImageElement) {
        this.originalImage = image;
        this.modifiedImage = image;
        this.originalImageSource.next(image);
        this.modifiedImageSource.next(image);
    }
}
