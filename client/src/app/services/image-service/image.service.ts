import { Injectable } from '@angular/core';
import { BACKGROUND_COLOR } from '@app/constants/drawing';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { BLACK_PIXEL, N_PIXEL_ATTRIBUTE, WHITE_PIXEL } from '@app/constants/pixels';
import { CanvasPosition } from '@app/enum/canvas-position';
import { ForegroundCanvasElements } from '@app/interfaces/foreground-canvas-elements';
import { ImageSources } from '@app/interfaces/image-sources';
import { GamePixels, Pixel } from '@app/interfaces/pixel';
import { DrawService } from '@app/services/draw-service/draw.service';
import { Coordinate } from '@common/coordinate';
@Injectable({
    providedIn: 'root',
})
export class ImageService {
    private leftBackgroundContext: CanvasRenderingContext2D;
    private rightBackgroundContext: CanvasRenderingContext2D;
    private combinedContext: CanvasRenderingContext2D;
    private leftImage: string;
    private rightImage: string;

    constructor(private readonly drawService: DrawService) {}

    resetBackground(canvasPosition: CanvasPosition) {
        switch (canvasPosition) {
            case CanvasPosition.Left:
                this.resetBackgroundContext(this.leftBackgroundContext);
                break;
            case CanvasPosition.Right:
                this.resetBackgroundContext(this.rightBackgroundContext);
                break;
            case CanvasPosition.Both:
                this.resetBackgroundContext(this.leftBackgroundContext);
                this.resetBackgroundContext(this.rightBackgroundContext);
                break;
        }
    }

    setBackground(canvasPosition: CanvasPosition, image: ImageBitmap) {
        switch (canvasPosition) {
            case CanvasPosition.Left:
                this.setBackgroundImage(image, this.leftBackgroundContext);
                break;
            case CanvasPosition.Right:
                this.setBackgroundImage(image, this.rightBackgroundContext);
                break;
            case CanvasPosition.Both:
                this.setBackgroundImage(image, this.leftBackgroundContext);
                this.setBackgroundImage(image, this.rightBackgroundContext);
                break;
        }
    }

    setCombinedContext(context: CanvasRenderingContext2D) {
        this.combinedContext = context;
    }

    setBackgroundContext(canvasPosition: CanvasPosition, context: CanvasRenderingContext2D) {
        switch (canvasPosition) {
            case CanvasPosition.Left:
                this.leftBackgroundContext = context;
                this.resetBackgroundContext(this.leftBackgroundContext);
                break;
            case CanvasPosition.Right:
                this.rightBackgroundContext = context;
                this.resetBackgroundContext(this.rightBackgroundContext);
                break;
        }
    }

    drawDifferences(differenceContext: CanvasRenderingContext2D, differences: Coordinate[]): void {
        const differencePixelArray = new Array(IMG_HEIGHT * IMG_WIDTH).fill(WHITE_PIXEL);
        for (const difference of differences) {
            differencePixelArray[difference.y * IMG_WIDTH + difference.x] = BLACK_PIXEL;
        }
        const differenceImageData = this.transformPixelArrayToImageData(differencePixelArray);
        differenceContext.putImageData(new ImageData(differenceImageData, IMG_WIDTH, IMG_HEIGHT), 0, 0);
    }

    getGamePixels(): GamePixels {
        const foregroundCanvasElements: ForegroundCanvasElements = this.drawService.getForegroundCanvasElements();
        const leftPixels: Pixel[] = this.getPixels(foregroundCanvasElements.left, this.leftBackgroundContext.canvas);
        this.leftImage = this.combinedContext.canvas.toDataURL();
        const rightPixels: Pixel[] = this.getPixels(foregroundCanvasElements.right, this.rightBackgroundContext.canvas);
        this.rightImage = this.combinedContext.canvas.toDataURL();
        return {
            leftImage: leftPixels,
            rightImage: rightPixels,
        };
    }

    getImageSources(): ImageSources {
        return { left: this.leftImage, right: this.rightImage };
    }

    private setBackgroundImage(imageToDraw: ImageBitmap, backgroundContext: CanvasRenderingContext2D) {
        backgroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.leftBackgroundContext.drawImage(imageToDraw, 0, 0);
    }

    private resetBackgroundContext(backgroundContext: CanvasRenderingContext2D) {
        backgroundContext.fillStyle = BACKGROUND_COLOR;
        backgroundContext.fillRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
    }

    private transformImageDataToPixelArray(imageData: Uint8ClampedArray): Pixel[] {
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

    private transformPixelArrayToImageData(pixelArray: Pixel[]): Uint8ClampedArray {
        const imageData = new Uint8ClampedArray(pixelArray.length * N_PIXEL_ATTRIBUTE);
        for (let i = 0; i < pixelArray.length; i++) {
            imageData[i * N_PIXEL_ATTRIBUTE] = pixelArray[i].red;
            imageData[i * N_PIXEL_ATTRIBUTE + 1] = pixelArray[i].green;
            imageData[i * N_PIXEL_ATTRIBUTE + 2] = pixelArray[i].blue;
            imageData[i * N_PIXEL_ATTRIBUTE + 3] = pixelArray[i].alpha;
        }
        return imageData;
    }

    private getPixels(foregroundCanvas: HTMLCanvasElement, backgroundCanvas: HTMLCanvasElement): Pixel[] {
        const combinedCanvasData: Uint8ClampedArray = this.combineCanvas(backgroundCanvas, foregroundCanvas);
        return this.transformImageDataToPixelArray(combinedCanvasData);
    }

    private combineCanvas(firstCanvas: HTMLCanvasElement, secondCanvas: HTMLCanvasElement): Uint8ClampedArray {
        this.combinedContext.drawImage(firstCanvas, 0, 0);
        this.combinedContext.drawImage(secondCanvas, 0, 0);
        return this.combinedContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT).data;
    }
}
