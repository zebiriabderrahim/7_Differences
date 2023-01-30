/* eslint-disable @typescript-eslint/no-magic-numbers */ // TO BE ERASED AFTER CREATION OF CONSTANTS FILES
import { HostListener, Injectable } from '@angular/core';
import { Game } from '@app/interfaces/game-interfaces';
import { Vec2 } from '@app/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class GameAreaService {
    game: Game;
    originalPixelData: ImageData;
    modifiedPixelData: ImageData;
    originalFrontPixelData: ImageData;
    modifiedFrontPixelData: ImageData;
    originalContext: CanvasRenderingContext2D;
    modifiedContext: CanvasRenderingContext2D;
    originalContextFrontLayer: CanvasRenderingContext2D;
    modifiedContextFrontLayer: CanvasRenderingContext2D;
    mousePosition: Vec2 = { x: 0, y: 0 };
    clickDisabled: boolean = false;
    // To Be put in constants file:
    maxWidth: number = 680;
    maxHeight: number = 480;
    leftButton: number = 0;
    middleButton: number = 1;
    rightButton: number = 2;
    backButton: number = 3;
    forwardButton: number = 4;

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

    detectLeftClick(event: MouseEvent): boolean {
        if (event.button === this.leftButton && !this.clickDisabled) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            return true;
        } else {
            return false;
        }
    }
    clearCanvasPixels(context: CanvasRenderingContext2D): void {
        context.clearRect(0, 0, this.maxWidth, this.maxHeight);
    }
    showError(isMainCanvas: boolean): void {
        let frontContext: CanvasRenderingContext2D;
        if (isMainCanvas) {
            frontContext = this.originalContextFrontLayer;
            frontContext.fillStyle = 'red';
        } else {
            frontContext = this.modifiedContextFrontLayer;
            frontContext.fillStyle = 'green';
        }
        this.clickDisabled = true;
        frontContext.font = 'bold 30px sheriff';
        frontContext.fillText('Erreur', this.mousePosition.x - 38, this.mousePosition.y);
        setTimeout(() => {
            this.clearCanvasPixels(frontContext);
            this.clickDisabled = false;
        }, 1000);
    }
}
