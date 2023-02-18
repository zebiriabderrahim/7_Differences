import { Injectable } from '@angular/core';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { BLACK_PIXEL, N_PIXEL_ATTRIBUTE, WHITE_PIXEL } from '@app/constants/pixels';
import { CanvasPosition } from '@app/enum/canvas-position';
import { ImageSources } from '@app/interfaces/image-sources';
import { GamePixels, Pixel } from '@app/interfaces/pixel';
import { Coordinate } from '@common/coordinate';

@Injectable({
    providedIn: 'root',
})
export class ImageService {
    private leftBackgroundContext: CanvasRenderingContext2D;
    private rightBackgroundContext: CanvasRenderingContext2D;
    private leftBackground: string;
    private rightBackground: string;

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

    setBackground(canvasPosition: CanvasPosition, image: ImageBitmap) {
        switch (canvasPosition) {
            case CanvasPosition.Left:
                this.setLeftBackground(image);
                break;
            case CanvasPosition.Right:
                this.setRightBackground(image);
                break;
            case CanvasPosition.Both:
                this.setLeftBackground(image);
                this.setRightBackground(image);
                break;
        }
    }

    setLeftBackground(imageToDraw: ImageBitmap) {
        this.leftBackgroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.leftBackgroundContext.drawImage(imageToDraw, 0, 0);
        this.leftBackground = this.leftBackgroundContext.canvas.toDataURL();
    }

    setRightBackground(imageToDraw: ImageBitmap) {
        this.rightBackgroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.rightBackgroundContext.drawImage(imageToDraw, 0, 0);
        this.rightBackground = this.rightBackgroundContext.canvas.toDataURL();
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

    getLeftPixels(): Pixel[] {
        const leftImageData = this.leftBackgroundContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT).data;
        return this.transformImageDataToPixelArray(leftImageData);
    }

    getRightPixels(): Pixel[] {
        const rightImageData = this.rightBackgroundContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT).data;
        return this.transformImageDataToPixelArray(rightImageData);
    }

    getGamePixels(): GamePixels {
        return { leftImage: this.getLeftPixels(), rightImage: this.getRightPixels() };
    }

    getImageSources(): ImageSources {
        return { left: this.leftBackground, right: this.rightBackground };
    }

    drawDifferences(differenceContext: CanvasRenderingContext2D, differences: Coordinate[]): void {
        const differencePixelArray = new Array(IMG_HEIGHT * IMG_WIDTH).fill(WHITE_PIXEL);
        for (const difference of differences) {
            differencePixelArray[difference.y * IMG_WIDTH + difference.x] = BLACK_PIXEL;
        }
        const differenceImageData = this.transformPixelArrayToImageData(differencePixelArray);
        differenceContext.putImageData(new ImageData(differenceImageData, IMG_WIDTH, IMG_HEIGHT), 0, 0);
    }
}
