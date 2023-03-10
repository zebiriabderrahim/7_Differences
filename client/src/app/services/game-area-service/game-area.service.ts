import { HostListener, Injectable } from '@angular/core';
import { FLASH_WAIT_TIME, GREEN_FLASH_TIME, LEFT_BUTTON, ONE_SECOND, X_CENTERING_DISTANCE, YELLOW_FLASH_TIME } from '@app/constants/constants';
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
                this.modifiedContextFrontLayer.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
                this.originalContextFrontLayer.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
                this.clickDisabled = false;
            }, FLASH_WAIT_TIME);
        }, YELLOW_FLASH_TIME);

        setTimeout(() => {
            clearInterval(firstInterval);
            this.modifiedContextFrontLayer.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
            this.originalContextFrontLayer.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
            this.clickDisabled = false;
        }, FLASH_WAIT_TIME);
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
