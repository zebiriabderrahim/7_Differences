import { Injectable } from '@angular/core';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/creation-page';
import { CanvasPosition } from '@app/enum/canvas-position';

@Injectable({
    providedIn: 'root',
})
export class ImageService {
    leftBackgroundContext: CanvasRenderingContext2D;
    rightBackgroundContext: CanvasRenderingContext2D;
    originalImage: string = '';
    modifiedImage: string = '';

    removeBackground(canvasPosition: CanvasPosition) {
        switch (canvasPosition) {
            case CanvasPosition.Left:
                this.resetOriginalImage();
                this.leftBackgroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
                this.leftBackgroundContext.drawImage(new Image(), 0, 0);
                break;
            case CanvasPosition.Right:
                this.resetModifiedImage();
                this.rightBackgroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
                this.rightBackgroundContext.drawImage(new Image(), 0, 0);
                break;
        }
    }

    resetOriginalImage() {
        this.originalImage = '';
    }

    resetModifiedImage() {
        this.modifiedImage = '';
    }

    resetBothCanvas() {
        this.resetOriginalImage();
        this.resetModifiedImage();
    }

    setBackground(canvasPosition: CanvasPosition, image: string) {
        const imageToDraw = new Image();
        imageToDraw.src = image;
        switch (canvasPosition) {
            case CanvasPosition.Left:
                this.setOriginalImage(image);
                this.leftBackgroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
                this.leftBackgroundContext.drawImage(imageToDraw, 0, 0);
                break;
            case CanvasPosition.Right:
                this.setModifiedImage(image);
                this.rightBackgroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
                this.rightBackgroundContext.drawImage(imageToDraw, 0, 0);
                break;
        }
    }

    setOriginalImage(image: string) {
        this.originalImage = image;
    }

    setModifiedImage(image: string) {
        this.modifiedImage = image;
    }

    setBackgroundContext(canvasPosition: CanvasPosition, context: CanvasRenderingContext2D){
        switch (canvasPosition) {
            case CanvasPosition.Left:
                this.leftBackgroundContext = context;
                break;
            case CanvasPosition.Right:
                this.rightBackgroundContext = context;
                break;
        }
    }

    setBothCanvas(image: string) {
        this.setBackground(CanvasPosition.Left, image);
        this.setBackground(CanvasPosition.Right, image);
    }
}
