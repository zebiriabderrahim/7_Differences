import { Injectable } from '@angular/core';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/creation-page';
import { BLACK_PIXEL, N_PIXEL_ATTRIBUTE, WHITE_PIXEL } from '@app/constants/pixels';
import { CanvasPosition } from '@app/enum/canvas-position';
import { Coordinate } from '@app/interfaces/coordinate';
import { GameDetails } from '@app/interfaces/game-interfaces';
import { Pixel } from '@app/interfaces/pixel';
import { DifferenceService } from '@app/services/difference-service/difference.service';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { GAME_ID_MAX } from '@app/constants/constants';

@Injectable({
    providedIn: 'root',
})
export class ImageService {
    leftBackgroundContext: CanvasRenderingContext2D;
    rightBackgroundContext: CanvasRenderingContext2D;
    differenceContext: CanvasRenderingContext2D;
    leftBackground: string = '';
    rightBackground: string = '';

    constructor(public differenceService: DifferenceService, public communicationService: CommunicationService) {}

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

    areImagesSet(): boolean {
        return this.leftBackground !== '' && this.rightBackground !== '';
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
            case CanvasPosition.Both:
                this.setBothBackgrounds(image);
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

    setDifferenceContext(context: CanvasRenderingContext2D, radius: number) {
        this.differenceContext = context;
        if (this.leftBackground && this.rightBackground) {
            this.validateDifferences(radius);
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
    validateDifferences(radius: number): void {
        const leftPixelArray = this.transformContextToPixelArray(this.leftBackgroundContext);
        const rightPixelArray = this.transformContextToPixelArray(this.rightBackgroundContext);
        const differenceCoordinates = this.differenceService.generateDifferences(leftPixelArray, rightPixelArray, radius);
        this.drawDifferences(differenceCoordinates);
    }

    drawDifferences(differences: Coordinate[]): void {
        const differencePixelArray = new Array(IMG_HEIGHT * IMG_WIDTH).fill(WHITE_PIXEL);
        for (const difference of differences) {
            differencePixelArray[difference.y * IMG_WIDTH + difference.x] = BLACK_PIXEL;
        }
        const differenceImageData = this.transformPixelArrayToImageData(differencePixelArray);
        this.differenceContext.putImageData(new ImageData(differenceImageData, IMG_WIDTH, IMG_HEIGHT), 0, 0);
    }

    createGame(name: string): void {
        const differences: Coordinate[][] = this.differenceService.generateDifferencesPackages();
        const gameDetails: GameDetails = {
            id: Math.floor(Math.random() * GAME_ID_MAX),
            name,
            originalImage: this.leftBackground,
            modifiedImage: this.rightBackground,
            nDifference: differences.length,
            differences,
            isHard: this.differenceService.isGameHard(),
        };
        this.resetBothBackgrounds();
        this.communicationService.postGame(gameDetails).subscribe();
    }
}
