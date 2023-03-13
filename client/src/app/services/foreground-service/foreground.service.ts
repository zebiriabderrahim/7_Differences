import { Injectable } from '@angular/core';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { CanvasPosition } from '@app/enum/canvas-position';
import { ForegroundCanvasElements } from '@app/interfaces/foreground-canvas-elements';
import { ForegroundsState } from '@app/interfaces/foregrounds-state';

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

    constructor() {
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
                this.resetForegroundContext(this.leftForegroundContext);
                this.saveCurrentCanvasState();
                break;
            case CanvasPosition.Right:
                this.resetForegroundContext(this.rightForegroundContext);
                this.saveCurrentCanvasState();
                break;
            case CanvasPosition.Both:
                this.resetForegroundContext(this.leftForegroundContext);
                this.resetForegroundContext(this.rightForegroundContext);
                break;
        }
    }

    resetForegroundContext(foregroundContext: CanvasRenderingContext2D) {
        foregroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
    }

    getForegroundCanvasElements(): ForegroundCanvasElements {
        return { left: this.leftForegroundContext.canvas, right: this.rightForegroundContext.canvas };
    }

    swapForegrounds() {
        const leftForegroundData: ImageData = this.leftForegroundContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        const rightForegroundData: ImageData = this.rightForegroundContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.leftForegroundContext.putImageData(rightForegroundData, 0, 0);
        this.rightForegroundContext.putImageData(leftForegroundData, 0, 0);
        this.saveCurrentCanvasState();
    }

    duplicateForeground(position: CanvasPosition) {
        const contextToDuplicate: CanvasRenderingContext2D =
            position === CanvasPosition.Left ? this.leftForegroundContext : this.rightForegroundContext;
        const contextToOverwrite: CanvasRenderingContext2D =
            position === CanvasPosition.Left ? this.rightForegroundContext : this.leftForegroundContext;
        const imageDataToDuplicate: ImageData = contextToDuplicate.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        contextToOverwrite.putImageData(imageDataToDuplicate, 0, 0);
        this.saveCurrentCanvasState();
    }

    saveCurrentCanvasState() {
        this.foregroundsStateStack.push(this.getForegroundsState());
    }

    getForegroundsState(): ForegroundsState {
        const leftForegroundData: ImageData = this.leftForegroundContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        const rightForegroundData: ImageData = this.rightForegroundContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        return { left: leftForegroundData, right: rightForegroundData };
    }

    redrawForegrounds(canvasState: ForegroundsState) {
        this.resetForeground(CanvasPosition.Both);
        this.leftForegroundContext.putImageData(canvasState.left, 0, 0);
        this.rightForegroundContext.putImageData(canvasState.right, 0, 0);
    }

    undoCanvasOperation() {
        if (this.foregroundsStateStack.length > 0) {
            const lastState: ForegroundsState = this.foregroundsStateStack.pop() as ForegroundsState;
            this.undoneForegroundsStateStack.push(lastState);
            if (!this.isCanvasStateNextState(lastState)) {
                this.redrawForegrounds(lastState);
            } else {
                this.undoCanvasOperation();
            }
        }
    }

    redoCanvasOperation() {
        if (this.undoneForegroundsStateStack.length > 0) {
            const lastState: ForegroundsState = this.undoneForegroundsStateStack.pop() as ForegroundsState;
            this.foregroundsStateStack.push(lastState);
            if (!this.isCanvasStateNextState(lastState)) {
                this.redrawForegrounds(lastState);
            } else {
                this.redoCanvasOperation();
            }
        }
    }

    isCanvasStateNextState(nextState: ForegroundsState): boolean {
        const canvasState: ForegroundsState = this.getForegroundsState();
        return (
            canvasState.left.data.toString() === nextState.left.data.toString() &&
            canvasState.right.data.toString() === nextState.right.data.toString()
        );
    }

    copyCanvas(canvas: HTMLCanvasElement, canvasPosition: CanvasPosition) {
        switch (canvasPosition) {
            case CanvasPosition.Left:
                this.leftForegroundContext.drawImage(canvas, 0, 0);
                break;
            case CanvasPosition.Right:
                this.rightForegroundContext.drawImage(canvas, 0, 0);
                break;
        }
        this.saveCurrentCanvasState();
    }
}
