import { HostListener, Injectable } from '@angular/core';
import {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    FLASH_WAIT_TIME,
    GREEN_FLASH_TIME,
    LEFT_BUTTON,
    ONE_SECOND,
    PIXEL_LENGTH,
    X_CENTERING_DISTANCE,
    YELLOW_FLASH_TIME,
} from '@app/constants/constants';
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

    @HostListener('keydown', ['$event'])
    loadImage(context: CanvasRenderingContext2D, path: string) {
        const image = new Image();
        image.onload = async () => {
            context.drawImage(await createImageBitmap(image), 0, 0);
        };
        image.src = path;
    }

    setAllData(): void {
        this.originalPixelData = this.originalContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.modifiedPixelData = this.modifiedContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.originalFrontPixelData = this.originalContextFrontLayer.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.modifiedFrontPixelData = this.modifiedContextFrontLayer.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    saveCoord(event: MouseEvent): void {
        this.mousePosition = { x: event.offsetX, y: event.offsetY };
    }

    detectLeftClick(event: MouseEvent): boolean {
        if (event.button === LEFT_BUTTON && !this.clickDisabled) {
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
        frontContext.fillText('Erreur', this.mousePosition.x - X_CENTERING_DISTANCE, this.mousePosition.y);
        setTimeout(() => {
            frontContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            this.clickDisabled = false;
        }, ONE_SECOND);
    }

    convert2DCoordToPixelIndex(differenceCoord: Coordinate[]): number[] {
        const imageDataIndex: number[] = [];
        for (const coord of differenceCoord) {
            const flatIndex = (coord.x + CANVAS_WIDTH * coord.y) * PIXEL_LENGTH;
            imageDataIndex.push(flatIndex);
        }
        return imageDataIndex;
    }

    replaceDifference(differenceCoord: Coordinate[]): void {
        const imageDataIndex = this.convert2DCoordToPixelIndex(differenceCoord);
        for (const index of imageDataIndex) {
            for (let i = 0; i < PIXEL_LENGTH; i++) {
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
            }, GREEN_FLASH_TIME);

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
                this.modifiedContextFrontLayer.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                this.originalContextFrontLayer.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                this.clickDisabled = false;
            }, FLASH_WAIT_TIME);
        }, YELLOW_FLASH_TIME);

        setTimeout(() => {
            clearInterval(firstInterval);
            this.modifiedContextFrontLayer.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            this.originalContextFrontLayer.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            this.clickDisabled = false;
        }, FLASH_WAIT_TIME);
    }
}
