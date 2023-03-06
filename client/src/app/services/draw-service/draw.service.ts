import { Injectable } from '@angular/core';
import { ERASER_COLOR } from '@app/constants/drawing';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { CanvasAction } from '@app/enum/canvas-action';
import { CanvasPosition } from '@app/enum/canvas-position';
import { CanvasOperation } from '@app/interfaces/canvas-operation';
import { CanvasState } from '@app/interfaces/canvas-state';
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

    constructor() {
        this.isDragging = false;
        this.canvasStateStack = [];
        this.undoneCanvasStateStack = [];
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

    swapForegrounds() {
        const leftForegroundData: ImageData = this.leftForegroundContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        const rightForegroundData: ImageData = this.rightForegroundContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.leftForegroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.leftForegroundContext.putImageData(rightForegroundData, 0, 0);
        this.rightForegroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.rightForegroundContext.putImageData(leftForegroundData, 0, 0);
        this.saveCurrentCanvasState();
    }

    duplicateLeftForeground() {
        const leftForegroundData: ImageData = this.leftForegroundContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.rightForegroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.rightForegroundContext.putImageData(leftForegroundData, 0, 0);
        this.saveCurrentCanvasState();
    }

    duplicateRightForeground() {
        const rightForegroundData: ImageData = this.rightForegroundContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.leftForegroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
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
            if (!this.isCurrentCanvasStateNextState(lastState)) {
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
            if (!this.isCurrentCanvasStateNextState(lastState)) {
                this.redrawForegrounds(lastState);
            } else {
                this.redoCanvasOperation();
            }
        }
    }

    isCurrentCanvasStateNextState(nextState: CanvasState): boolean {
        const canvasState: CanvasState = this.getCanvasState();
        return (
            canvasState.left.data.toString() === nextState.left.data.toString() &&
            canvasState.right.data.toString() === nextState.right.data.toString()
        );
    }

    getImageDataAsString(canvas: HTMLCanvasElement): string {
        return canvas.getContext('2d')?.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT).data.toString() as string;
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
        this.leftForegroundContext.drawImage(new Image(), 0, 0);
    }

    resetRightForeground() {
        this.rightForegroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        this.rightForegroundContext.drawImage(new Image(), 0, 0);
    }

    getCanvasState(): CanvasState {
        const leftForegroundData: ImageData = this.leftForegroundContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        const rightForegroundData: ImageData = this.rightForegroundContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
        return { left: leftForegroundData, right: rightForegroundData };
    }

    setActiveCanvas(canvasPosition: CanvasPosition) {
        this.activeCanvas = canvasPosition;
        switch (canvasPosition) {
            case CanvasPosition.Left:
                this.activeContext = this.leftFrontContext;
                break;
            case CanvasPosition.Right:
                this.activeContext = this.rightFrontContext;
                break;
        }
    }

    setClickPosition(event: MouseEvent) {
        this.clickPosition = { x: event.offsetX, y: event.offsetY };
    }

    setCanvasOperationStyle(color: string, operationWidth: number) {
        if (this.currentAction === CanvasAction.Rectangle) {
            this.activeContext.fillStyle = color;
        } else {
            this.activeContext.lineWidth = operationWidth;
            switch (this.currentAction) {
                case CanvasAction.Pencil:
                    this.activeContext.strokeStyle = color;
                    this.activeContext.lineCap = 'round';
                    this.activeContext.lineJoin = 'round';
                    break;
                case CanvasAction.Eraser:
                    this.activeContext.strokeStyle = ERASER_COLOR;
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
            this.activeContext.lineTo(event.offsetX, event.offsetY);
            this.activeContext.stroke();
        }
        this.isDragging = true;
    }

    continueCanvasOperation(canvasPosition: CanvasPosition, event: MouseEvent) {
        this.setClickPosition(event);
        if (this.isDragging && this.activeCanvas === canvasPosition) {
            if (this.currentAction === CanvasAction.Rectangle) {
                this.drawRectangle();
            } else {
                this.drawLine(event);
            }
        }
    }

    stopCanvasOperation(canvasPosition: CanvasPosition, event: MouseEvent) {
        this.setClickPosition(event);
        if (this.isDragging) {
            if (this.currentAction === CanvasAction.Rectangle) {
                this.drawRectangle();
            } else {
                this.drawLine(event);
            }
            this.isDragging = false;
            this.copyCanvas(this.activeContext.canvas, canvasPosition);
            this.resetActiveCanvas();
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
