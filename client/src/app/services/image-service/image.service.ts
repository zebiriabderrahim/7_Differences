import { Injectable } from '@angular/core';
import { Pixel } from '@app/interfaces/pixel';
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
        switch (canvasPosition) {
            case CanvasPosition.Left:
                this.setLeftBackground(image);
                break;
            case CanvasPosition.Right:
                this.setRightBackground(image);
                break;
        }
    }

    //TODO: Possible to avoid code duplication?
    setLeftBackground(image: string) {
        const imageToDraw = new Image();
        imageToDraw.src = image;
        this.leftBackground = image;
        this.leftBackgroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.leftBackgroundContext.drawImage(imageToDraw, 0, 0);
    }

    setRightBackground(image: string){
        const imageToDraw = new Image();
        imageToDraw.src = image;
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
        this.setLeftBackground(image);
        this.setRightBackground(image);
    }
    
    transformContextToPixelArray(context: CanvasRenderingContext2D): Pixel[] {
        const imageData = context.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        const data = imageData.data;
        const pixelArray: Pixel[] = [];
        for (let i = 0; i < data.length; i += 4) {
            const pixel : Pixel = {
                red: data[i],
                green: data[i + 1],
                blue: data[i + 2],
                alpha: data[i + 3],
            };
            pixelArray.push(pixel);
        }
        console.log(pixelArray);
        return pixelArray;
    }

    //Pixel[y][x] is the pixel at position (x,y)
    transformPixelArrayToPixelMatrix(pixelArray: Pixel[]): Pixel[][] {
        const pixelMatrix: Pixel[][] = [];
        for (let i = 0; i < IMG_HEIGHT; i++) {
            pixelMatrix.push(pixelArray.slice(i * IMG_WIDTH, (i + 1) * IMG_WIDTH));
        }
        return pixelMatrix;
    }
    comparePixelArrays(pixelArray1: Pixel[], pixelArray2: Pixel[]): Pixel[] {
        const blackPixel: Pixel = {
            red: 0,
            green: 0,
            blue: 0,
            alpha: 255,
        };
        const whitePixel: Pixel = {
            red: 255,
            green: 255,
            blue: 255,
            alpha: 255,            
        }
        const difference: Pixel[] = new Array(IMG_HEIGHT * IMG_WIDTH).fill(whitePixel);
        for (let i = 0; i < pixelArray1.length; i++) {
            if(this.arePixelsDifferent(pixelArray1[i], pixelArray2[i])){
                difference[i] = blackPixel;
            }
        }
        return difference;
    }

    arePixelsDifferent(pixel1: Pixel, pixel2: Pixel): boolean {
        return !(pixel1.red === pixel2.red && pixel1.green === pixel2.green && pixel1.blue === pixel2.blue);
    }

    generateDifferencePixelArray(): Pixel[] {
        const leftPixelArray = this.transformContextToPixelArray(this.leftBackgroundContext);
        const rightPixelArray = this.transformContextToPixelArray(this.rightBackgroundContext);
        return this.comparePixelArrays(leftPixelArray, rightPixelArray);
    }

    transformPixelArrayToImageData(pixelArray: Pixel[]): Uint8ClampedArray {
        const data = new Uint8ClampedArray(IMG_WIDTH * IMG_HEIGHT * 4);
        for (let i = 0; i < pixelArray.length; i++) {
            data[i * 4] = pixelArray[i].red;
            data[i * 4 + 1] = pixelArray[i].green;
            data[i * 4 + 2] = pixelArray[i].blue;
            data[i * 4 + 3] = pixelArray[i].alpha;
        }
        return data;
    }

    validateDifferences() {
        const differencePixelArray = this.generateDifferencePixelArray();
        const differenceImageData = this.transformPixelArrayToImageData(differencePixelArray);
        this.resetLeftBackground();
        this.leftBackgroundContext.putImageData(new ImageData(differenceImageData, IMG_WIDTH, IMG_HEIGHT), 0, 0);
    }
}
