import { Injectable } from '@angular/core';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/creation-page';
import { BLACK_PIXEL, N_PIXEL_ATTRIBUTE, WHITE_PIXEL } from '@app/constants/pixels';
import { CanvasPosition } from '@app/enum/canvas-position';
import { Coordinate } from '@app/interfaces/coordinate';
import { ImageSources } from '@app/interfaces/image-sources';
import { GamePixels, Pixel } from '@app/interfaces/pixel';

@Injectable({
    providedIn: 'root',
})
export class ImageService {
    leftBackgroundContext: CanvasRenderingContext2D;
    rightBackgroundContext: CanvasRenderingContext2D;
    differenceContext: CanvasRenderingContext2D;
    leftBackground: string;
    rightBackground: string;

    constructor() {
        this.leftBackground = '';
        this.rightBackground = '';
    }

    areImagesSet(): boolean {
        return this.leftBackground !== '' && this.rightBackground !== '';
    }

    resetBackground(canvasPosition: CanvasPosition) {
        switch (canvasPosition) {
            case CanvasPosition.Left:
                this.resetLeftBackground();
                break;
            case CanvasPosition.Right:
                this.resetRightBackground();
                break;
            case CanvasPosition.Both:
                this.resetBothBackgrounds();
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

    setBackground(canvasPosition: CanvasPosition, imageSource: string) {
        const imageToDraw = new Image();
        imageToDraw.src = imageSource;
        switch (canvasPosition) {
            case CanvasPosition.Left:
                this.setLeftBackground(imageToDraw);
                break;
            case CanvasPosition.Right:
                this.setRightBackground(imageToDraw);
                break;
            case CanvasPosition.Both:
                this.setLeftBackground(imageToDraw);
                this.setRightBackground(imageToDraw);
                break;
        }
    }

    setLeftBackground(imageToDraw: HTMLImageElement) {
        this.leftBackground = imageToDraw.src;
        this.leftBackgroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.leftBackgroundContext.drawImage(imageToDraw, 0, 0);
    }

    setRightBackground(imageToDraw: HTMLImageElement) {
        this.rightBackground = imageToDraw.src;
        this.rightBackgroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.rightBackgroundContext.drawImage(imageToDraw, 0, 0);
    }

    setBackgroundContext(canvasPosition: CanvasPosition, context: CanvasRenderingContext2D) {
        switch (canvasPosition) {
            case CanvasPosition.Left:
                this.leftBackgroundContext = context;
                break;
            case CanvasPosition.Right:
                this.rightBackgroundContext = context;
                break;
        }
    }

    transformImageDataToPixelArray(imageData: Uint8ClampedArray): Pixel[] {
        const pixelArray: Pixel[] = [];
        for (let i = 0; i < imageData.length; i += N_PIXEL_ATTRIBUTE) {
            const pixel: Pixel = {
                red: imageData[i],
                green: imageData[i + 1],
                blue: imageData[i + 2],
                alpha: imageData[i + 3],
            };
            pixelArray.push(pixel);
        }
        return pixelArray;
    }

    transformPixelArrayToImageData(pixelArray: Pixel[]): Uint8ClampedArray {
        const imageData = new Uint8ClampedArray(pixelArray.length * N_PIXEL_ATTRIBUTE);
        for (let i = 0; i < pixelArray.length; i++) {
            imageData[i * N_PIXEL_ATTRIBUTE] = pixelArray[i].red;
            imageData[i * N_PIXEL_ATTRIBUTE + 1] = pixelArray[i].green;
            imageData[i * N_PIXEL_ATTRIBUTE + 2] = pixelArray[i].blue;
            imageData[i * N_PIXEL_ATTRIBUTE + 3] = pixelArray[i].alpha;
        }
        return imageData;
    }

    getGamePixels(): GamePixels {
        const leftImageData = this.leftBackgroundContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT).data;
        const rightImageData = this.rightBackgroundContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT).data;
        const leftImagePixels = this.transformImageDataToPixelArray(leftImageData);
        const rightImagePixels = this.transformImageDataToPixelArray(rightImageData);
        const gamePixels: GamePixels = { leftImage: leftImagePixels, rightImage: rightImagePixels };
        return gamePixels;
    }

    getImageSources(): ImageSources {
        return { left: this.leftBackground, right: this.rightBackground };
    }

    drawDifferenceImage(differences: Coordinate[]): void {
        const differencePixelArray = new Array(IMG_HEIGHT * IMG_WIDTH).fill(WHITE_PIXEL);
        for (const difference of differences) {
            differencePixelArray[difference.y * IMG_WIDTH + difference.x] = BLACK_PIXEL;
        }
        const differenceImageData = this.transformPixelArrayToImageData(differencePixelArray);
        this.differenceContext.putImageData(new ImageData(differenceImageData, IMG_WIDTH, IMG_HEIGHT), 0, 0);
    }
}
