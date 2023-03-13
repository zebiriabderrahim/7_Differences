import { HostListener, Injectable } from '@angular/core';
import {
    FLASH_WAIT_TIME,
    GREEN_FLASH_TIME,
    LEFT_BUTTON,
    MAX_PIXEL_INTENSITY,
    MIN_PIXEL_INTENSITY,
    ONE_SECOND,
    STRONG_PIXEL_INTENSITY,
    X_CENTERING_DISTANCE,
    YELLOW_FLASH_TIME,
} from '@app/constants/constants';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { N_PIXEL_ATTRIBUTE } from '@app/constants/pixels';
import { Coordinate } from '@common/coordinate';

@Injectable({
    providedIn: 'root',
})
export class GameAreaService {
    private originalPixelData: ImageData;
    private modifiedPixelData: ImageData;
    private originalFrontPixelData: ImageData;
    private modifiedFrontPixelData: ImageData;
    private originalContext: CanvasRenderingContext2D;
    private modifiedContext: CanvasRenderingContext2D;
    private originalContextFrontLayer: CanvasRenderingContext2D;
    private modifiedContextFrontLayer: CanvasRenderingContext2D;
    private mousePosition: Coordinate = { x: 0, y: 0 };
    private clickDisabled: boolean = false;

    @HostListener('keydown', ['$event'])
    setAllData(): void {
        this.originalPixelData = this.originalContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.modifiedPixelData = this.modifiedContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.originalFrontPixelData = this.originalContextFrontLayer.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.modifiedFrontPixelData = this.modifiedContextFrontLayer.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
    }

    saveCoord(event: MouseEvent): void {
        this.mousePosition = { x: event.offsetX, y: event.offsetY };
    }

    detectLeftClick(event: MouseEvent): boolean {
        return event.button === LEFT_BUTTON && !this.clickDisabled ? (this.saveCoord(event), true) : false;
    }

    showError(isMainCanvas: boolean): void {
        const frontContext: CanvasRenderingContext2D = isMainCanvas ? this.originalContextFrontLayer : this.modifiedContextFrontLayer;
        frontContext.fillStyle = 'red';
        this.clickDisabled = true;
        frontContext.font = 'bold 30px sheriff';
        frontContext.fillText('ERREUR', this.mousePosition.x - X_CENTERING_DISTANCE, this.mousePosition.y);
        setTimeout(() => {
            frontContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
            this.clickDisabled = false;
        }, ONE_SECOND);
    }

    convert2DCoordToPixelIndex(differenceCoord: Coordinate[]): number[] {
        const imageDataIndex: number[] = [];
        for (const coord of differenceCoord) {
            const flatIndex = (coord.x + IMG_WIDTH * coord.y) * N_PIXEL_ATTRIBUTE;
            imageDataIndex.push(flatIndex);
        }
        return imageDataIndex;
    }

    replaceDifference(differenceCoord: Coordinate[]): void {
        const imageDataIndex = this.convert2DCoordToPixelIndex(differenceCoord);
        for (const index of imageDataIndex) {
            for (let i = 0; i < N_PIXEL_ATTRIBUTE; i++) {
                this.modifiedPixelData.data[index + i] = this.originalPixelData.data[index + i];
            }
        }
        this.modifiedContext.putImageData(this.modifiedPixelData, 0, 0);
        this.flashCorrectPixels(differenceCoord);
    }

    flashCorrectPixels(differenceCoord: Coordinate[]): void {
        const imageDataIndexes = this.convert2DCoordToPixelIndex(differenceCoord);
        this.flashPixelsLogic(imageDataIndexes);
    }

    flashPixelsLogic(imageDataIndexes: number[]): void {
        const firstInterval = setInterval(() => {
            const secondInterval = setInterval(() => {
                this.setPixelData(imageDataIndexes, this.modifiedFrontPixelData, this.originalFrontPixelData);
                this.putImageDataToContexts();
            }, GREEN_FLASH_TIME);

            const color = [MAX_PIXEL_INTENSITY, STRONG_PIXEL_INTENSITY, 0, MAX_PIXEL_INTENSITY];
            for (const index of imageDataIndexes) {
                this.modifiedFrontPixelData.data.set(color, index);
                this.originalFrontPixelData.data.set(color, index);
            }
            this.putImageDataToContexts();

            this.setTime(secondInterval);
        }, YELLOW_FLASH_TIME);

        this.setTime(firstInterval);
    }

    setPixelData(imageDataIndexes: number[], modifiedFrontPixelData: ImageData, originalFrontPixelData: ImageData): void {
        for (const index of imageDataIndexes) {
            modifiedFrontPixelData.data[index] = MIN_PIXEL_INTENSITY;
            modifiedFrontPixelData.data[index + 1] = MAX_PIXEL_INTENSITY;
            modifiedFrontPixelData.data[index + 2] = MIN_PIXEL_INTENSITY;
            modifiedFrontPixelData.data[index + 3] = MAX_PIXEL_INTENSITY;

            originalFrontPixelData.data[index] = MIN_PIXEL_INTENSITY;
            originalFrontPixelData.data[index + 1] = MAX_PIXEL_INTENSITY;
            originalFrontPixelData.data[index + 2] = MIN_PIXEL_INTENSITY;
            originalFrontPixelData.data[index + 3] = MAX_PIXEL_INTENSITY;
        }
    }

    putImageDataToContexts(): void {
        this.modifiedContextFrontLayer.putImageData(this.modifiedFrontPixelData, 0, 0);
        this.originalContextFrontLayer.putImageData(this.originalFrontPixelData, 0, 0);
    }

    setTime(intervalNumber: NodeJS.Timer): void {
        setTimeout(() => {
            clearInterval(intervalNumber);
            this.clearFlashing();
        }, FLASH_WAIT_TIME);
    }

    clearFlashing(): void {
        this.modifiedContextFrontLayer.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.originalContextFrontLayer.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.clickDisabled = false;
    }

    getOgContext(): CanvasRenderingContext2D {
        return this.originalContext;
    }

    getOgFrontContext(): CanvasRenderingContext2D {
        return this.originalContextFrontLayer;
    }

    setOgContext(context: CanvasRenderingContext2D): void {
        this.originalContext = context;
    }

    setOgFrontContext(context: CanvasRenderingContext2D): void {
        this.originalContextFrontLayer = context;
    }

    getMdContext(): CanvasRenderingContext2D {
        return this.modifiedContext;
    }

    getMdFrontContext(): CanvasRenderingContext2D {
        return this.modifiedContextFrontLayer;
    }

    setMdContext(context: CanvasRenderingContext2D): void {
        this.modifiedContext = context;
    }

    setMdFrontContext(context: CanvasRenderingContext2D): void {
        this.modifiedContextFrontLayer = context;
    }

    getMousePosition(): Coordinate {
        return this.mousePosition;
    }
}
