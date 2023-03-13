import { Injectable } from '@angular/core';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { CanvasAction } from '@app/enum/canvas-action';
import { CanvasPosition } from '@app/enum/canvas-position';
import { CanvasOperation } from '@app/interfaces/canvas-operation';
import { CanvasState } from '@app/interfaces/canvas-state';
import { ForegroundCanvasElements } from '@app/interfaces/foreground-canvas-elements';
import { Coordinate } from '@common/coordinate';

@Injectable({
    providedIn: 'root',
})
export class DrawService {
    private leftForegroundContext: CanvasRenderingContext2D;
    private rightForegroundContext: CanvasRenderingContext2D;
    private leftFrontContext: CanvasRenderingContext2D;
    private rightFrontContext: CanvasRenderingContext2D;
    private activeContext: CanvasRenderingContext2D;
    private canvasStateStack: CanvasState[];
    private undoneCanvasStateStack: CanvasState[];
    private activeCanvas: CanvasPosition;
    private isDragging: boolean;
    private isSquare: boolean;
    private rectangleTopCorner: Coordinate;
    private currentAction: CanvasAction;
    private clickPosition: Coordinate;
    private isMouseOutOfCanvas: boolean;

    constructor() {
        this.isDragging = false;
        this.canvasStateStack = [];
        this.undoneCanvasStateStack = [];
    }

    setMousePosition(event: MouseEvent, isMouseLeaving: boolean): void {
        this.isMouseOutOfCanvas = isMouseLeaving;
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

    disableDragging(): void {
        if (this.isDragging) {
            this.isDragging = false;
            this.saveCurrentCanvasState();
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
        this.saveCurrentCanvasState();
    }

    duplicateLeftForeground() {
        const leftForegroundData: ImageData = this.leftForegroundContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.rightForegroundContext.putImageData(leftForegroundData, 0, 0);
        this.saveCurrentCanvasState();
    }

    duplicateRightForeground() {
        const rightForegroundData: ImageData = this.rightForegroundContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.leftForegroundContext.putImageData(rightForegroundData, 0, 0);
        this.saveCurrentCanvasState();
    }

    redrawForegrounds(canvasState: CanvasState) {
        this.resetForeground(CanvasPosition.Both);
        this.leftForegroundContext.putImageData(canvasState.left, 0, 0);
        this.rightForegroundContext.putImageData(canvasState.right, 0, 0);
    }

    undoCanvasOperation() {
        if (this.canvasStateStack.length > 0) {
            const lastState: CanvasState = this.canvasStateStack.pop() as CanvasState;
            this.undoneCanvasStateStack.push(lastState);
            if (!this.isCanvasStateNextState(lastState)) {
                this.redrawForegrounds(lastState);
            } else {
                this.undoCanvasOperation();
            }
        }
    }

    redoCanvasOperation() {
        if (this.undoneCanvasStateStack.length > 0) {
            const lastState: CanvasState = this.undoneCanvasStateStack.pop() as CanvasState;
            this.canvasStateStack.push(lastState);
            if (!this.isCanvasStateNextState(lastState)) {
                this.redrawForegrounds(lastState);
            } else {
                this.redoCanvasOperation();
            }
        }
    }

    isCanvasStateNextState(nextState: CanvasState): boolean {
        const canvasState: CanvasState = this.getCanvasState();
        return (
            canvasState.left.data.toString() === nextState.left.data.toString() &&
            canvasState.right.data.toString() === nextState.right.data.toString()
        );
    }

    resetForeground(canvasPosition: CanvasPosition) {
        switch (canvasPosition) {
            case CanvasPosition.Left:
                this.resetLeftForeground();
                break;
            case CanvasPosition.Right:
                this.resetRightForeground();
                break;
            case CanvasPosition.Both:
                this.resetLeftForeground();
                this.resetRightForeground();
                break;
        }
    }

    resetLeftForeground() {
        this.leftForegroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
    }

    resetRightForeground() {
        this.rightForegroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
    }

    getCanvasState(): CanvasState {
        const leftForegroundData: ImageData = this.leftForegroundContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        const rightForegroundData: ImageData = this.rightForegroundContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        return { left: leftForegroundData, right: rightForegroundData };
    }

    setActiveCanvas(canvasPosition: CanvasPosition) {
        this.activeCanvas = canvasPosition;
        if (this.currentAction === CanvasAction.Rectangle) {
            switch (canvasPosition) {
                case CanvasPosition.Left:
                    this.activeContext = this.leftFrontContext;
                    break;
                case CanvasPosition.Right:
                    this.activeContext = this.rightFrontContext;
                    break;
            }
        } else {
            switch (canvasPosition) {
                case CanvasPosition.Left:
                    this.activeContext = this.leftForegroundContext;
                    break;
                case CanvasPosition.Right:
                    this.activeContext = this.rightForegroundContext;
                    break;
            }
        }
    }

    setClickPosition(event: MouseEvent) {
        this.clickPosition = { x: event.offsetX, y: event.offsetY };
    }

    setCanvasOperationStyle(color: string, operationWidth: number) {
        if (this.currentAction === CanvasAction.Rectangle) {
            this.activeContext.globalCompositeOperation = 'source-over';
            this.rightForegroundContext.globalCompositeOperation = 'source-over';
            this.leftForegroundContext.globalCompositeOperation = 'source-over';
            this.activeContext.fillStyle = color;
        } else {
            this.activeContext.lineWidth = operationWidth;
            switch (this.currentAction) {
                case CanvasAction.Pencil:
                    this.activeContext.strokeStyle = color;
                    this.activeContext.globalCompositeOperation = 'source-over';
                    this.activeContext.lineCap = 'round';
                    this.activeContext.lineJoin = 'round';
                    break;
                case CanvasAction.Eraser:
                    this.activeContext.strokeStyle = color;
                    this.activeContext.globalCompositeOperation = 'destination-out';
                    this.activeContext.lineCap = 'square';
                    this.activeContext.lineJoin = 'round';
                    break;
            }
        }
    }

    startCanvasOperation(canvasOperation: CanvasOperation, event: MouseEvent) {
        this.undoneCanvasStateStack = [];
        if (this.canvasStateStack.length === 0) {
            this.canvasStateStack.push(this.getCanvasState());
        }
        this.currentAction = canvasOperation.action;
        this.setActiveCanvas(canvasOperation.position);
        this.setCanvasOperationStyle(canvasOperation.color, canvasOperation.width);
        this.setClickPosition(event);
        if (this.currentAction === CanvasAction.Rectangle) {
            this.rectangleTopCorner = this.clickPosition;
        } else {
            this.activeContext.beginPath();
            this.drawLine(event);
        }
        this.isDragging = true;
    }

    continueCanvasOperation(canvasPosition: CanvasPosition, event: MouseEvent) {
        this.setClickPosition(event);
        if (this.isDragging && this.activeCanvas === canvasPosition) {
            if (this.currentAction === CanvasAction.Rectangle) {
                this.drawRectangle();
            } else {
                if (this.isMouseOutOfCanvas) {
                    this.activeContext.closePath();
                    this.activeContext.beginPath();
                    this.isMouseOutOfCanvas = false;
                }
                this.drawLine(event);
            }
        }
    }

    stopCanvasOperation(canvasPosition: CanvasPosition, event: MouseEvent) {
        this.setClickPosition(event);
        if (this.isDragging && this.activeCanvas === canvasPosition) {
            if (this.currentAction === CanvasAction.Rectangle) {
                this.drawRectangle();
                this.copyCanvas(this.activeContext.canvas, canvasPosition);
                this.resetActiveCanvas();
            } else {
                this.drawLine(event);
                this.saveCurrentCanvasState();
            }
            this.isDragging = false;
        }
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

    saveCurrentCanvasState() {
        this.canvasStateStack.push(this.getCanvasState());
    }

    drawRectangle() {
        this.activeContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        const rectangleWidth: number = this.clickPosition.x - this.rectangleTopCorner.x;
        const rectangleHeight: number = this.isSquare ? rectangleWidth : this.clickPosition.y - this.rectangleTopCorner.y;
        this.activeContext.fillRect(this.rectangleTopCorner.x, this.rectangleTopCorner.y, rectangleWidth, rectangleHeight);
    }

    drawLine(event: MouseEvent) {
        this.activeContext.lineTo(event.offsetX, event.offsetY);
        this.activeContext.stroke();
    }

    resetActiveCanvas() {
        this.activeContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
    }

    enableSquareMode() {
        if (this.isDragging && this.currentAction === CanvasAction.Rectangle) {
            this.drawRectangle();
            this.isSquare = true;
        }
    }

    disableSquareMode() {
        if (this.isDragging && this.currentAction === CanvasAction.Rectangle) {
            this.drawRectangle();
            this.isSquare = false;
        }
    }
}
