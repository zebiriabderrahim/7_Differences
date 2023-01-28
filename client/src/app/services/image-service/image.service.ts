import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ImageService {
    // private originalImageSource = new Subject<HTMLImageElement>();
    // private modifiedImageSource = new Subject<HTMLImageElement>();

    // originalImageObservable = this.originalImageSource.asObservable();
    // modifiedImageObservable = this.modifiedImageSource.asObservable();

    // originalImage: HTMLImageElement = new Image();
    // modifiedImage: HTMLImageElement = new Image();
    private originalImageSource = new Subject<string>();
    private modifiedImageSource = new Subject<string>();

    originalImageObservable = this.originalImageSource.asObservable();
    modifiedImageObservable = this.modifiedImageSource.asObservable();

    originalImage: string = '';
    modifiedImage: string = '';

    resetBothCanvas() {
        this.originalImage = '';
        this.modifiedImage = '';
        this.originalImageSource.next(this.originalImage);
        this.modifiedImageSource.next(this.modifiedImage);
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
        // setOriginalImage(image: HTMLImageElement) {
        //     this.originalImage = image;
        //     this.originalImageSource.next(image);
        // }

        // setModifiedImage(image: HTMLImageElement) {
        //     this.modifiedImage = image;
        //     this.modifiedImageSource.next(image);
        // }

        // setBothCanvas(image: HTMLImageElement) {
        //     this.setOriginalImage(image);
        //     this.setModifiedImage(image);
        // }
    }
}
