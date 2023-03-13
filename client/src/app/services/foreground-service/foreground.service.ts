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
                this.resetForegroundContext(this.leftForegroundContext);
                this.saveCurrentForegroundsState();
                break;
            case CanvasPosition.Right:
                this.resetForegroundContext(this.rightForegroundContext);
                this.saveCurrentForegroundsState();
                break;
            case CanvasPosition.Both:
                this.resetForegroundContext(this.leftForegroundContext);
                this.resetForegroundContext(this.rightForegroundContext);
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

    getActiveContext(canvasPosition: CanvasPosition): CanvasRenderingContext2D {
        switch (canvasPosition) {
            case CanvasPosition.Left:
                return this.drawService.isCurrentActionRectangle() ? this.leftFrontContext : this.leftForegroundContext;
            case CanvasPosition.Right:
                return this.drawService.isCurrentActionRectangle() ? this.rightFrontContext : this.rightForegroundContext;
            default:
                return this.drawService.isCurrentActionRectangle() ? this.leftFrontContext : this.leftForegroundContext;
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
        this.drawService.setActiveContext(this.getActiveContext(canvasPosition));
        this.drawService.setClickPosition(event);
        this.drawService.startOperation();
    }

    disableDragging() {
        if (this.drawService.isMouseBeingDragged()) {
            this.drawService.disableMouseDrag();
            this.saveCurrentForegroundsState();
        }
    }

    stopForegroundOperation(canvasPosition: CanvasPosition, event: MouseEvent) {
        this.drawService.setClickPosition(event);
        if (this.drawService.isMouseBeingDragged() && this.drawService.getActiveCanvasPosition() === canvasPosition) {
            this.drawService.stopOperation();
            if (this.drawService.isCurrentActionRectangle()) {
                this.copyCanvas(this.drawService.getActiveContext().canvas, canvasPosition);
                this.drawService.resetActiveCanvas();
            } else {
                this.saveCurrentForegroundsState();
            }
        }
    }

    private copyCanvas(canvas: HTMLCanvasElement, canvasPosition: CanvasPosition) {
        switch (canvasPosition) {
            case CanvasPosition.Left:
                this.leftForegroundContext.drawImage(canvas, 0, 0);
                break;
            case CanvasPosition.Right:
                this.rightForegroundContext.drawImage(canvas, 0, 0);
                break;
        }
        this.saveCurrentForegroundsState();
    }

    private redrawForegrounds(canvasState: ForegroundsState) {
        this.resetForeground(CanvasPosition.Both);
        this.leftForegroundContext.putImageData(canvasState.left, 0, 0);
        this.rightForegroundContext.putImageData(canvasState.right, 0, 0);
    }

    private getForegroundsState(): ForegroundsState {
        const leftForegroundData: ImageData = this.leftForegroundContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        const rightForegroundData: ImageData = this.rightForegroundContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        return { left: leftForegroundData, right: rightForegroundData };
    }

    private isCanvasStateNextState(nextState: ForegroundsState): boolean {
        const canvasState: ForegroundsState = this.getForegroundsState();
        return (
            canvasState.left.data.toString() === nextState.left.data.toString() &&
            canvasState.right.data.toString() === nextState.right.data.toString()
        );
    }

    private saveCurrentForegroundsState() {
        this.foregroundsStateStack.push(this.getForegroundsState());
    }

    private resetForegroundContext(foregroundContext: CanvasRenderingContext2D) {
        foregroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
    }
}
