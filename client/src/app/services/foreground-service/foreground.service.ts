import { Injectable } from '@angular/core';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { CanvasPosition } from '@app/enum/canvas-position';
import { ForegroundCanvasElements } from '@app/interfaces/foreground-canvas-elements';
import { ForegroundsState } from '@app/interfaces/foregrounds-state';
import { DrawService } from '@app/services/draw-service/draw.service';

@Injectable({
    providedIn: 'root',
})
export class ForegroundService {
    private leftForegroundContext: CanvasRenderingContext2D;
    private rightForegroundContext: CanvasRenderingContext2D;
    private leftFrontContext: CanvasRenderingContext2D;
    private rightFrontContext: CanvasRenderingContext2D;
    private foregroundsStateStack: ForegroundsState[];
    private undoneForegroundsStateStack: ForegroundsState[];

    constructor(private readonly drawService: DrawService) {
        this.foregroundsStateStack = [];
        this.undoneForegroundsStateStack = [];
    }

    setForegroundContext(canvasPosition: CanvasPosition, foregroundContext: CanvasRenderingContext2D, frontContext: CanvasRenderingContext2D) {
        switch (canvasPosition) {
            case CanvasPosition.Left:
                this.leftForegroundContext = foregroundContext;
                this.leftFrontContext = frontContext;
                break;
            case CanvasPosition.Right:
                this.rightForegroundContext = foregroundContext;
                this.rightFrontContext = frontContext;
                break;
        }
    }

    resetForeground(canvasPosition: CanvasPosition) {
        switch (canvasPosition) {
            case CanvasPosition.Left:
                this.resetCanvasContext(this.leftForegroundContext);
                this.saveCurrentForegroundsState();
                break;
            case CanvasPosition.Right:
                this.resetCanvasContext(this.rightForegroundContext);
                this.saveCurrentForegroundsState();
                break;
            case CanvasPosition.Both:
                this.resetCanvasContext(this.leftForegroundContext);
                this.resetCanvasContext(this.rightForegroundContext);
                break;
        }
    }

    getForegroundCanvasElements(): ForegroundCanvasElements {
        return { left: this.leftForegroundContext.canvas, right: this.rightForegroundContext.canvas };
    }

    swapForegrounds() {
        const leftForegroundData: ImageData = this.leftForegroundContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        const rightForegroundData: ImageData = this.rightForegroundContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.leftForegroundContext.putImageData(rightForegroundData, 0, 0);
        this.rightForegroundContext.putImageData(leftForegroundData, 0, 0);
        this.saveCurrentForegroundsState();
    }

    duplicateForeground(position: CanvasPosition) {
        const contextToDuplicate: CanvasRenderingContext2D =
            position === CanvasPosition.Left ? this.leftForegroundContext : this.rightForegroundContext;
        const contextToOverwrite: CanvasRenderingContext2D =
            position === CanvasPosition.Left ? this.rightForegroundContext : this.leftForegroundContext;
        const imageDataToDuplicate: ImageData = contextToDuplicate.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        contextToOverwrite.putImageData(imageDataToDuplicate, 0, 0);
        this.saveCurrentForegroundsState();
    }

    undoCanvasOperation() {
        if (this.foregroundsStateStack.length > 1) {
            const actualState: ForegroundsState = this.foregroundsStateStack.pop() as ForegroundsState;
            this.undoneForegroundsStateStack.push(actualState);
            this.redrawForegrounds(this.foregroundsStateStack[this.foregroundsStateStack.length - 1]);
        }
    }

    redoCanvasOperation() {
        if (this.undoneForegroundsStateStack.length > 0) {
            const actualState: ForegroundsState = this.undoneForegroundsStateStack.pop() as ForegroundsState;
            this.foregroundsStateStack.push(actualState);
            this.redrawForegrounds(actualState);
        }
    }

    startForegroundOperation(canvasPosition: CanvasPosition, event: MouseEvent) {
        this.undoneForegroundsStateStack = [];
        if (this.foregroundsStateStack.length === 0) {
            this.foregroundsStateStack.push(this.getForegroundsState());
        }
        if (this.drawService.isCurrentActionRectangle()) {
            this.rightForegroundContext.globalCompositeOperation = 'source-over';
            this.leftForegroundContext.globalCompositeOperation = 'source-over';
        }

        this.drawService.setActiveCanvasPosition(canvasPosition);
        this.setActiveContext(canvasPosition);
        this.drawService.setClickPosition(event);
        this.drawService.startOperation();
    }

    disableDragging() {
        if (this.drawService.isMouseDragged()) {
            this.drawService.disableMouseDrag();
            this.saveDrawing();
        }
    }

    stopForegroundOperation(canvasPosition: CanvasPosition, event: MouseEvent) {
        this.drawService.setClickPosition(event);
        if (this.drawService.isOperationValid(canvasPosition)) {
            this.drawService.stopOperation();
            this.saveDrawing();
        }
    }

    private saveDrawing() {
        if (this.drawService.isCurrentActionRectangle()) {
            this.copyFrontCanvasToForeground(this.drawService.getActiveCanvasPosition());
        }
        this.saveCurrentForegroundsState();
    }

    private copyFrontCanvasToForeground(canvasPosition: CanvasPosition) {
        switch (canvasPosition) {
            case CanvasPosition.Left:
                this.leftForegroundContext.drawImage(this.leftFrontContext.canvas, 0, 0);
                this.resetCanvasContext(this.leftFrontContext);
                break;
            case CanvasPosition.Right:
                this.rightForegroundContext.drawImage(this.rightFrontContext.canvas, 0, 0);
                this.resetCanvasContext(this.rightFrontContext);
                break;
        }
    }

    private setActiveContext(canvasPosition: CanvasPosition) {
        switch (canvasPosition) {
            case CanvasPosition.Left:
                this.drawService.setActiveContext(this.drawService.isCurrentActionRectangle() ? this.leftFrontContext : this.leftForegroundContext);
                break;
            case CanvasPosition.Right:
                this.drawService.setActiveContext(this.drawService.isCurrentActionRectangle() ? this.rightFrontContext : this.rightForegroundContext);
                break;
        }
    }

    private redrawForegrounds(foregroundsState: ForegroundsState) {
        this.resetForeground(CanvasPosition.Both);
        this.leftForegroundContext.putImageData(foregroundsState.left, 0, 0);
        this.rightForegroundContext.putImageData(foregroundsState.right, 0, 0);
    }

    private getForegroundsState(): ForegroundsState {
        const leftForegroundData: ImageData = this.leftForegroundContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        const rightForegroundData: ImageData = this.rightForegroundContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        return { left: leftForegroundData, right: rightForegroundData };
    }

    private saveCurrentForegroundsState() {
        this.foregroundsStateStack.push(this.getForegroundsState());
    }

    private resetCanvasContext(context: CanvasRenderingContext2D) {
        context.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
    }

    // private resetFrontCanvasContext(canvasPosition: CanvasPosition) {
    //     switch (canvasPosition) {
    //         case CanvasPosition.Left:
    //             this.resetCanvasContext(this.leftFrontContext);
    //             break;
    //         case CanvasPosition.Right:
    //             this.resetCanvasContext(this.rightFrontContext);
    //             break;
    //     }
    // }
}
