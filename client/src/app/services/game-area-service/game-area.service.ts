import { HostListener, Injectable } from '@angular/core';
import {
    FLASH_WAIT_TIME,
    GREEN_FLASH_TIME,
    LEFT_BUTTON,
    MAX_PIXEL_INTENSITY,
    MIN_PIXEL_INTENSITY,
    ONE_SECOND,
    RGBA_SIZE,
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
    private correctSoundEffect: HTMLAudioElement;
    private incorrectSoundEffect: HTMLAudioElement;

    constructor() {
        this.correctSoundEffect = new Audio('assets/sound/WinSoundEffect.mp3');
        this.incorrectSoundEffect = new Audio('assets/sound/ErrorSoundEffect.mp3');
    }

    @HostListener('keydown', ['$event'])
    loadImage(context: CanvasRenderingContext2D, path: string) {
        const image = new Image();
        image.onload = async () => {
            context.drawImage(await createImageBitmap(image), 0, 0);
        };
        image.src = path;
    }

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
        this.playErrorSound();
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
        this.playCorrectSound();
        const imageDataIndexes = this.convert2DCoordToPixelIndex(differenceCoord);
        const firstInterval = setInterval(() => {
            const secondInterval = setInterval(() => {
                for (const index of imageDataIndexes) {
                    for (let i = 0; i < RGBA_SIZE; i++) {
                        this.modifiedFrontPixelData.data[index + i] = i === 1 || i === 3 ? MAX_PIXEL_INTENSITY : MIN_PIXEL_INTENSITY;
                        this.originalFrontPixelData.data[index + i] = i === 1 || i === 3 ? MAX_PIXEL_INTENSITY : MIN_PIXEL_INTENSITY;
                    }
                }
                this.modifiedContextFrontLayer.putImageData(this.modifiedFrontPixelData, 0, 0);
                this.originalContextFrontLayer.putImageData(this.originalFrontPixelData, 0, 0);
            }, GREEN_FLASH_TIME);

            const color = [MAX_PIXEL_INTENSITY, STRONG_PIXEL_INTENSITY, 0, MAX_PIXEL_INTENSITY];
            for (const index of imageDataIndexes) {
                this.modifiedFrontPixelData.data.set(color, index);
                this.originalFrontPixelData.data.set(color, index);
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

    playErrorSound(): void {
        this.incorrectSoundEffect.play();
    }

    playCorrectSound(): void {
        this.correctSoundEffect.play();
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
