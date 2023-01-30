import { Injectable } from '@angular/core';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/creation-page';
import { CanvasPosition } from '@app/enum/canvas-position';

@Injectable({
    providedIn: 'root',
})
export class ImageService {
    leftBackgroundContext: CanvasRenderingContext2D;
    rightBackgroundContext: CanvasRenderingContext2D;
    leftBackground: string = '';
    rightBackground: string = '';

    resetBackground(canvasPosition: CanvasPosition) {
        switch (canvasPosition) {
            case CanvasPosition.Left:
                this.resetLeftBackground();
                break;
            case CanvasPosition.Right:
                this.resetRightBackground();
                break;
        }
    }

    resetLeftBackground() {
        this.leftBackground = '';
        this.leftBackgroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.leftBackgroundContext.drawImage(new Image(), 0, 0);
    }

    resetRightBackground() {
        this.rightBackground = '';
        this.rightBackgroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.rightBackgroundContext.drawImage(new Image(), 0, 0);
    }

    resetBothBackgrounds() {
        this.resetLeftBackground();
        this.resetRightBackground();
    }

    setBackground(canvasPosition: CanvasPosition, image: string) {
        const imageToDraw = new Image();
        imageToDraw.src = image;
        switch (canvasPosition) {
            case CanvasPosition.Left:
                this.setLeftBackground(image, imageToDraw);
                break;
            case CanvasPosition.Right:
                this.setRightBackground(image, imageToDraw);
                break;
        }
    }

    setLeftBackground(image: string, imageToDraw: HTMLImageElement) {
        this.leftBackground = image;
        this.leftBackgroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.leftBackgroundContext.drawImage(imageToDraw, 0, 0);
    }

    setRightBackground(image: string, imageToDraw: HTMLImageElement){
        this.rightBackground = image;
        this.rightBackgroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.rightBackgroundContext.drawImage(imageToDraw, 0, 0);
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

    setBothBackgrounds(image: string) {
        this.setBackground(CanvasPosition.Left, image);
        this.setBackground(CanvasPosition.Right, image);
    }
}
