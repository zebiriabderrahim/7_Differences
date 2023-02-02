import { Injectable } from '@angular/core';
import { DEFAULT_RADIUS, IMG_HEIGHT, IMG_WIDTH } from '@app/constants/creation-page';
import { BLACK_PIXEL, N_PIXEL_ATTRIBUTE, WHITE_PIXEL } from '@app/constants/pixels';
import { CanvasPosition } from '@app/enum/canvas-position';
import { Coordinate } from '@app/interfaces/coordinate';
import { Pixel } from '@app/interfaces/pixel';

@Injectable({
    providedIn: 'root',
})
export class ImageService {
    leftBackgroundContext: CanvasRenderingContext2D;
    rightBackgroundContext: CanvasRenderingContext2D;
    differenceContext: CanvasRenderingContext2D;
    leftBackground: string = '';
    rightBackground: string = '';

    enlargementRadius: number = DEFAULT_RADIUS;

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
        switch (canvasPosition) {
            case CanvasPosition.Left:
                this.setLeftBackground(image);
                break;
            case CanvasPosition.Right:
                this.setRightBackground(image);
                break;
        }
    }

    // TODO: Possible to avoid code duplication?
    setLeftBackground(image: string) {
        const imageToDraw = new Image();
        imageToDraw.src = image;
        this.leftBackground = image;
        this.leftBackgroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.leftBackgroundContext.drawImage(imageToDraw, 0, 0);
    }

    setRightBackground(image: string) {
        const imageToDraw = new Image();
        imageToDraw.src = image;
        this.rightBackground = image;
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

    setEnlargementRadius(radius: number) {
        this.enlargementRadius = radius;
    }

    setDifferenceContext(context: CanvasRenderingContext2D) {
        this.differenceContext = context;
        if (this.leftBackground && this.rightBackground) {
            this.validateDifferences(this.enlargementRadius);
        }
    }

    setBothBackgrounds(image: string) {
        this.setLeftBackground(image);
        this.setRightBackground(image);
    }

    transformContextToPixelArray(context: CanvasRenderingContext2D): Pixel[] {
        const imageData = context.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        const data = imageData.data;
        const pixelArray: Pixel[] = [];
        for (let i = 0; i < data.length; i += N_PIXEL_ATTRIBUTE) {
            const pixel: Pixel = {
                red: data[i],
                green: data[i + 1],
                blue: data[i + 2],
                alpha: data[i + 3],
            };
            pixelArray.push(pixel);
        }
        return pixelArray;
    }

    generateDifferences(pixelArray1: Pixel[], pixelArray2: Pixel[]): Coordinate[] {
        const differentCoordinates: Coordinate[] = [];
        for (let i = 0; i < pixelArray1.length; i++) {
            if (this.arePixelsDifferent(pixelArray1[i], pixelArray2[i])) {
                const x = i % IMG_WIDTH;
                const y = Math.floor(i / IMG_WIDTH);
                differentCoordinates.push({ x, y });
            }
        }
        return differentCoordinates;
    }

    arePixelsDifferent(pixel1: Pixel, pixel2: Pixel): boolean {
        return !(pixel1.red === pixel2.red && pixel1.green === pixel2.green && pixel1.blue === pixel2.blue);
    }

    transformPixelArrayToImageData(pixelArray: Pixel[]): Uint8ClampedArray {
        const data = new Uint8ClampedArray(IMG_WIDTH * IMG_HEIGHT * N_PIXEL_ATTRIBUTE);
        for (let i = 0; i < pixelArray.length; i++) {
            data[i * N_PIXEL_ATTRIBUTE] = pixelArray[i].red;
            data[i * N_PIXEL_ATTRIBUTE + 1] = pixelArray[i].green;
            data[i * N_PIXEL_ATTRIBUTE + 2] = pixelArray[i].blue;
            data[i * N_PIXEL_ATTRIBUTE + 3] = pixelArray[i].alpha;
        }
        return data;
    }

    enlargeDifferences(differenceCoordinates: Coordinate[], radius: number): Coordinate[] {
        const visitedDifferences: boolean[][] = new Array(IMG_WIDTH).fill(false).map(() => new Array(IMG_HEIGHT).fill(false)) as boolean[][];
        const enlargedDifferenceCoordinates: Coordinate[] = [];
        for (const coordinate of differenceCoordinates) {
            for (let i = -radius; i <= radius; i++) {
                for (let j = -radius; j <= radius; j++) {
                    const distance = Math.sqrt(i * i + j * j);
                    if (distance <= radius) {
                        const largerCoordinate: Coordinate = { x: coordinate.x + i, y: coordinate.y + j };
                        if (this.isCoordinateValid(largerCoordinate) && !visitedDifferences[largerCoordinate.x][largerCoordinate.y]) {
                            enlargedDifferenceCoordinates.push(largerCoordinate);
                            visitedDifferences[largerCoordinate.x][largerCoordinate.y] = true;
                        }
                    }
                }
            }
        }
        return enlargedDifferenceCoordinates;
    }

    isCoordinateValid(coordinate: Coordinate): boolean {
        return coordinate.x >= 0 && coordinate.x < IMG_WIDTH && coordinate.y >= 0 && coordinate.y < IMG_HEIGHT;
    }

    validateDifferences(radius: number): void {
        const leftPixelArray = this.transformContextToPixelArray(this.leftBackgroundContext);
        const rightPixelArray = this.transformContextToPixelArray(this.rightBackgroundContext);
        const differenceCoordinates = this.generateDifferences(leftPixelArray, rightPixelArray);
        const enlargedDifferences = this.enlargeDifferences(differenceCoordinates, radius);
        this.drawDifferences(enlargedDifferences);
    }

    drawDifferences(differences: Coordinate[]): void {
        const differencePixelArray = new Array(IMG_HEIGHT * IMG_WIDTH).fill(WHITE_PIXEL);
        for (const difference of differences) {
            differencePixelArray[difference.y * IMG_WIDTH + difference.x] = BLACK_PIXEL;
        }
        const differenceImageData = this.transformPixelArrayToImageData(differencePixelArray);
        this.differenceContext.putImageData(new ImageData(differenceImageData, IMG_WIDTH, IMG_HEIGHT), 0, 0);
    }
}
