import { HostListener, Injectable } from '@angular/core';
import {
    CHEAT_MODE_WAIT_TIME,
    FLASH_WAIT_TIME,
    GREEN_FLASH_TIME,
    LEFT_BUTTON,
    ONE_SECOND,
    RED_FLASH_TIME,
    X_CENTERING_DISTANCE,
    YELLOW_FLASH_TIME
} from '@app/constants/constants';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { GREEN_PIXEL, N_PIXEL_ATTRIBUTE, RED_PIXEL, YELLOW_PIXEL } from '@app/constants/pixels';
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
    private isCheatMode: boolean = false;
    private cheatModeInterval: number | undefined;

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

    replaceDifference(differenceCoord: Coordinate[]): void {
        const imageDataIndex = this.convert2DCoordToPixelIndex(differenceCoord);
        for (const index of imageDataIndex) {
            for (let i = 0; i < N_PIXEL_ATTRIBUTE; i++) {
                this.modifiedPixelData.data[index + i] = this.originalPixelData.data[index + i];
            }
        }
        this.modifiedContext.putImageData(this.modifiedPixelData, 0, 0);
        this.resetCheatMode();
        this.flashCorrectPixels(differenceCoord);
    }

    flashCorrectPixels(differenceCoord: Coordinate[]): void {
        const imageDataIndexes = this.convert2DCoordToPixelIndex(differenceCoord);
        this.flashPixels(imageDataIndexes);
    }

    flashPixels(imageDataIndexes: number[]): void {
        const firstInterval = setInterval(() => {
            const secondInterval = setInterval(() => {
                this.setPixelData(imageDataIndexes, this.modifiedFrontPixelData, this.originalFrontPixelData);
                this.putImageDataToContexts();
            }, GREEN_FLASH_TIME);

            const color = [YELLOW_PIXEL.red, YELLOW_PIXEL.green, YELLOW_PIXEL.blue, YELLOW_PIXEL.alpha];
            for (const index of imageDataIndexes) {
                this.modifiedFrontPixelData.data.set(color, index);
                this.originalFrontPixelData.data.set(color, index);
            }
            this.putImageDataToContexts();

            setTimeout(() => {
                clearInterval(secondInterval);
                this.clearFlashing();
            }, FLASH_WAIT_TIME);
        }, YELLOW_FLASH_TIME);

        setTimeout(() => {
            clearInterval(firstInterval);
            this.clearFlashing();
        }, FLASH_WAIT_TIME);
    }

    toggleCheatMode(startDifferences: Coordinate[]): void {
        const imageDataIndexes: number[] = this.convert2DCoordToPixelIndex(startDifferences);
        if (!this.isCheatMode) {
            this.cheatModeInterval = setInterval(() => {
                const color = [RED_PIXEL.red, RED_PIXEL.green, RED_PIXEL.blue, RED_PIXEL.alpha];
                for (const index of imageDataIndexes) {
                    this.modifiedFrontPixelData.data.set(color, index);
                    this.originalFrontPixelData.data.set(color, index);
                }
                this.putImageDataToContexts();

                setTimeout(() => {
                    this.clearFlashing();
                }, RED_FLASH_TIME);
            }, CHEAT_MODE_WAIT_TIME) as unknown as number;
        } else {
            clearInterval(this.cheatModeInterval);
            this.clearFlashing();
        }
        this.isCheatMode = !this.isCheatMode;
    }

    setPixelData(imageDataIndexes: number[], modifiedFrontPixelData: ImageData, originalFrontPixelData: ImageData): void {
        for (const index of imageDataIndexes) {
            modifiedFrontPixelData.data[index] = GREEN_PIXEL.red;
            modifiedFrontPixelData.data[index + 1] = GREEN_PIXEL.green;
            modifiedFrontPixelData.data[index + 2] = GREEN_PIXEL.blue;
            modifiedFrontPixelData.data[index + 3] = GREEN_PIXEL.alpha;

            originalFrontPixelData.data[index] = GREEN_PIXEL.red;
            originalFrontPixelData.data[index + 1] = GREEN_PIXEL.green;
            originalFrontPixelData.data[index + 2] = GREEN_PIXEL.blue;
            originalFrontPixelData.data[index + 3] = GREEN_PIXEL.alpha;
        }
    }

    putImageDataToContexts(): void {
        this.modifiedContextFrontLayer?.putImageData(this.modifiedFrontPixelData, 0, 0);
        this.originalContextFrontLayer?.putImageData(this.originalFrontPixelData, 0, 0);
    }

    clearFlashing(): void {
        this.modifiedContextFrontLayer?.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.originalContextFrontLayer?.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.originalFrontPixelData = this.originalContextFrontLayer?.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.modifiedFrontPixelData = this.modifiedContextFrontLayer?.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
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

    resetCheatMode(): void {
        this.isCheatMode = false;
        clearInterval(this.cheatModeInterval);
    }

    private convert2DCoordToPixelIndex(differenceCoord: Coordinate[]): number[] {
        const imageDataIndex: number[] = [];
        for (const coord of differenceCoord) {
            const flatIndex = (coord.x + IMG_WIDTH * coord.y) * N_PIXEL_ATTRIBUTE;
            imageDataIndex.push(flatIndex);
        }
        return imageDataIndex;
    }
}
