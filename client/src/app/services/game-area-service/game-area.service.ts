import { HostListener, Injectable } from '@angular/core';
import {
    CHEAT_MODE_WAIT_TIME,
    FLASH_WAIT_TIME,
    GREEN_FLASH_TIME,
    LEFT_BUTTON,
    ONE_SECOND,
    RED_FLASH_TIME,
    X_CENTERING_DISTANCE,
    YELLOW_FLASH_TIME,
} from '@app/constants/constants';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { GREEN_PIXEL, N_PIXEL_ATTRIBUTE, RED_PIXEL, YELLOW_PIXEL } from '@app/constants/pixels';
import { ReplayActions } from '@app/enum/replay-actions';
import { ReplayEvent } from '@app/interfaces/replay-actions';
import { Coordinate } from '@common/coordinate';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameAreaService {
    replayEventsSubject: Subject<ReplayEvent>;
    mousePosition: Coordinate;
    private originalPixelData: ImageData;
    private modifiedPixelData: ImageData;
    private originalFrontPixelData: ImageData;
    private modifiedFrontPixelData: ImageData;
    private originalContext: CanvasRenderingContext2D;
    private modifiedContext: CanvasRenderingContext2D;
    private originalContextFrontLayer: CanvasRenderingContext2D;
    private modifiedContextFrontLayer: CanvasRenderingContext2D;
    private clickDisabled: boolean;
    private isCheatMode: boolean;
    private cheatModeInterval: number | undefined;

    constructor() {
        this.mousePosition = { x: 0, y: 0 };
        this.clickDisabled = false;
        this.isCheatMode = false;
        this.replayEventsSubject = new Subject<ReplayEvent>();
    }

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

    showError(isMainCanvas: boolean, errorCoordinate: Coordinate, replaySpeed?: number): void {
        const speed = replaySpeed ? replaySpeed : 1;
        const frontContext: CanvasRenderingContext2D = isMainCanvas ? this.originalContextFrontLayer : this.modifiedContextFrontLayer;
        frontContext.fillStyle = 'red';
        this.clickDisabled = true;
        frontContext.font = 'bold 30px sheriff';
        frontContext.fillText('ERREUR', errorCoordinate.x - X_CENTERING_DISTANCE, errorCoordinate.y);
        setTimeout(() => {
            frontContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
            this.clickDisabled = false;
        }, ONE_SECOND / speed);
        const replayEvent: ReplayEvent = {
            action: ReplayActions.ClickError,
            timestamp: Date.now(),
            data: { isMainCanvas, pos: errorCoordinate },
        };
        this.replayEventsSubject.next(replayEvent);
    }

    replaceDifference(differenceCoord: Coordinate[], replaySpeed?: number, isPaused: boolean = false): void {
        const imageDataIndex = this.convert2DCoordToPixelIndex(differenceCoord);
        for (const index of imageDataIndex) {
            for (let i = 0; i < N_PIXEL_ATTRIBUTE; i++) {
                this.modifiedPixelData.data[index + i] = this.originalPixelData.data[index + i];
            }
        }
        this.modifiedContext.putImageData(this.modifiedPixelData, 0, 0);
        this.resetCheatMode();
        const replayEvent: ReplayEvent = {
            action: ReplayActions.ClickFound,
            timestamp: Date.now(),
            data: differenceCoord,
        };
        this.replayEventsSubject.next(replayEvent);
        this.flashCorrectPixels(differenceCoord, replaySpeed, isPaused);
    }

    flashCorrectPixels(differenceCoord: Coordinate[], replaySpeed?: number, isPaused: boolean = false): void {
        const imageDataIndexes = this.convert2DCoordToPixelIndex(differenceCoord);
        this.flashPixels(imageDataIndexes, replaySpeed, isPaused);
    }

    flashPixels(imageDataIndexes: number[], replaySpeed?: number, isPaused: boolean = false): void {
        const speed = replaySpeed ? replaySpeed : 1;
        const firstInterval = setInterval(() => {
            const secondInterval = setInterval(() => {
                this.setPixelData(imageDataIndexes, this.modifiedFrontPixelData, this.originalFrontPixelData);
                this.putImageDataToContexts();
            }, GREEN_FLASH_TIME / speed);

            const color = [YELLOW_PIXEL.red, YELLOW_PIXEL.green, YELLOW_PIXEL.blue, YELLOW_PIXEL.alpha];
            for (const index of imageDataIndexes) {
                this.modifiedFrontPixelData.data.set(color, index);
                this.originalFrontPixelData.data.set(color, index);
            }
            this.putImageDataToContexts();

            setTimeout(() => {
                clearInterval(secondInterval);
                this.clearFlashing(isPaused);
            }, FLASH_WAIT_TIME / speed);
        }, YELLOW_FLASH_TIME / speed);

        setTimeout(() => {
            clearInterval(firstInterval);
            this.clearFlashing(isPaused);
        }, FLASH_WAIT_TIME / speed);
    }

    toggleCheatMode(startDifferences: Coordinate[], replaySpeed?: number): void {
        let replayEvent: ReplayEvent;
        const speed = replaySpeed ? replaySpeed : 1;
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
                }, RED_FLASH_TIME / speed);
            }, CHEAT_MODE_WAIT_TIME / speed) as unknown as number;
            replayEvent = {
                action: ReplayActions.ActivateCheat,
                timestamp: Date.now(),
                data: startDifferences,
            };
            this.replayEventsSubject.next(replayEvent);
        } else {
            replayEvent = {
                action: ReplayActions.DeactivateCheat,
                timestamp: Date.now(),
                data: startDifferences,
            };
            this.replayEventsSubject.next(replayEvent);
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

    clearFlashing(isPaused: boolean = false): void {
        if (!isPaused) {
            this.modifiedContextFrontLayer?.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
            this.originalContextFrontLayer?.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
            this.originalFrontPixelData = this.originalContextFrontLayer?.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
            this.modifiedFrontPixelData = this.modifiedContextFrontLayer?.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
            this.clickDisabled = false;
        }
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
