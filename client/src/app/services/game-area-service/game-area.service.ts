/* eslint-disable @typescript-eslint/no-magic-numbers */ // TO BE ERASED AFTER CREATION OF CONSTANTS FILES
import { HostListener, Injectable } from '@angular/core';
import { Coordinate } from '@common/coordinate';

@Injectable({
    providedIn: 'root',
})
export class GameAreaService {
    originalPixelData: ImageData;
    modifiedPixelData: ImageData;
    originalFrontPixelData: ImageData;
    modifiedFrontPixelData: ImageData;
    originalContext: CanvasRenderingContext2D;
    modifiedContext: CanvasRenderingContext2D;
    originalContextFrontLayer: CanvasRenderingContext2D;
    modifiedContextFrontLayer: CanvasRenderingContext2D;
    mousePosition: Coordinate = { x: 0, y: 0 };
    clickDisabled: boolean = false;
    correctSoundEffect: HTMLAudioElement = new Audio('assets/sound/WinSoundEffect.mp3');
    incorrectSoundEffect: HTMLAudioElement = new Audio('assets/sound/ErrorSoundEffect.mp3');
    // To Be put in constants file:
    maxWidth: number = 640;
    maxHeight: number = 480;
    leftButton: number = 0;
    middleButton: number = 1;
    rightButton: number = 2;
    backButton: number = 3;
    forwardButton: number = 4;
    pixelLength: number = 4;

    @HostListener('keydown', ['$event'])
    loadImage(context: CanvasRenderingContext2D, path: string) {
        const image = new Image();
        image.onload = async () => {
            context.drawImage(await createImageBitmap(image), 0, 0);
        };
        image.src = path;
    }

    setAllData(): void {
        this.originalPixelData = this.originalContext.getImageData(0, 0, this.maxWidth, this.maxHeight);
        this.modifiedPixelData = this.modifiedContext.getImageData(0, 0, this.maxWidth, this.maxHeight);
        this.originalFrontPixelData = this.originalContextFrontLayer.getImageData(0, 0, this.maxWidth, this.maxHeight);
        this.modifiedFrontPixelData = this.modifiedContextFrontLayer.getImageData(0, 0, this.maxWidth, this.maxHeight);
    }

    saveCoord(event: MouseEvent): void {
        this.mousePosition = { x: event.offsetX, y: event.offsetY };
    }

    detectLeftClick(event: MouseEvent): boolean {
        if (event.button === this.leftButton && !this.clickDisabled) {
            this.saveCoord(event);
            return true;
        } else {
            return false;
        }
    }

    showError(isMainCanvas: boolean): void {
        let frontContext: CanvasRenderingContext2D;
        if (isMainCanvas) {
            frontContext = this.originalContextFrontLayer;
        } else {
            frontContext = this.modifiedContextFrontLayer;
        }
        this.incorrectSoundEffect.play();
        frontContext.fillStyle = 'red';
        this.clickDisabled = true;
        frontContext.font = 'bold 30px sheriff';
        frontContext.fillText('Erreur', this.mousePosition.x - 38, this.mousePosition.y);
        setTimeout(() => {
            frontContext.clearRect(0, 0, this.maxWidth, this.maxHeight);
            this.clickDisabled = false;
        }, 1000);
    }

    convert2DCoordToPixelIndex(differenceCoord: Coordinate[]): number[] {
        const imageDataIndex: number[] = [];
        for (const coord of differenceCoord) {
            const flatIndex = (coord.x + this.maxWidth * coord.y) * this.pixelLength;
            imageDataIndex.push(flatIndex);
        }
        return imageDataIndex;
    }

    replaceDifference(differenceCoord: Coordinate[]): void {
        const imageDataIndex = this.convert2DCoordToPixelIndex(differenceCoord);
        for (const index of imageDataIndex) {
            for (let i = 0; i < this.pixelLength; i++) {
                this.modifiedPixelData.data[index + i] = this.originalPixelData.data[index + i];
            }
        }
        this.modifiedContext.putImageData(this.modifiedPixelData, 0, 0);
        this.flashCorrectPixels(differenceCoord);
    }

    flashCorrectPixels(differenceCoord: Coordinate[]): void {
        this.correctSoundEffect.play();
        const imageDataIndexes = this.convert2DCoordToPixelIndex(differenceCoord);
        const firstInterval = setInterval(() => {
            const secondInterval = setInterval(() => {
                for (const index of imageDataIndexes) {
                    this.modifiedFrontPixelData.data[index] = 0;
                    this.modifiedFrontPixelData.data[index + 1] = 255;
                    this.modifiedFrontPixelData.data[index + 2] = 0;
                    this.modifiedFrontPixelData.data[index + 3] = 255;
                    this.originalFrontPixelData.data[index] = 0;
                    this.originalFrontPixelData.data[index + 1] = 255;
                    this.originalFrontPixelData.data[index + 2] = 0;
                    this.originalFrontPixelData.data[index + 3] = 255;
                }
                this.modifiedContextFrontLayer.putImageData(this.modifiedFrontPixelData, 0, 0);
                this.originalContextFrontLayer.putImageData(this.originalFrontPixelData, 0, 0);
            }, 40);

            for (const index of imageDataIndexes) {
                this.modifiedFrontPixelData.data[index] = 255;
                this.modifiedFrontPixelData.data[index + 1] = 244;
                this.modifiedFrontPixelData.data[index + 2] = 0;
                this.modifiedFrontPixelData.data[index + 3] = 255;
                this.originalFrontPixelData.data[index] = 255;
                this.originalFrontPixelData.data[index + 1] = 244;
                this.originalFrontPixelData.data[index + 2] = 0;
                this.originalFrontPixelData.data[index + 3] = 255;
            }
            this.modifiedContextFrontLayer.putImageData(this.modifiedFrontPixelData, 0, 0);
            this.originalContextFrontLayer.putImageData(this.originalFrontPixelData, 0, 0);

            setTimeout(() => {
                clearInterval(secondInterval);
                this.modifiedContextFrontLayer.clearRect(0, 0, this.maxWidth, this.maxHeight);
                this.originalContextFrontLayer.clearRect(0, 0, this.maxWidth, this.maxHeight);
            }, 500);
        }, 50);

        setTimeout(() => {
            clearInterval(firstInterval);
            this.modifiedContextFrontLayer.clearRect(0, 0, this.maxWidth, this.maxHeight);
            this.originalContextFrontLayer.clearRect(0, 0, this.maxWidth, this.maxHeight);
        }, 500);
    }
}
