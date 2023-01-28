/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ImageService {
    private originalImageSource = new Subject<string>();
    private modifiedImageSource = new Subject<string>();

    originalImageObservable = this.originalImageSource.asObservable();
    modifiedImageObservable = this.modifiedImageSource.asObservable();

    originalImage: string = '';
    modifiedImage: string = '';

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
