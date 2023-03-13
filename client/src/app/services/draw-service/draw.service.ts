import { Injectable } from '@angular/core';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { CanvasAction } from '@app/enum/canvas-action';
import { CanvasPosition } from '@app/enum/canvas-position';
// import { CanvasOperation } from '@app/interfaces/canvas-operation';
// import { CanvasState } from '@app/interfaces/canvas-state';
// import { ForegroundCanvasElements } from '@app/interfaces/foreground-canvas-elements';
// import { ForegroundService } from '@app/services/foreground-service/foreground.service';
import { Coordinate } from '@common/coordinate';

@Injectable({
    providedIn: 'root',
})
export class DrawService {
    // private leftForegroundContext: CanvasRenderingContext2D;
    // private rightForegroundContext: CanvasRenderingContext2D;
    // private leftFrontContext: CanvasRenderingContext2D;
    // private rightFrontContext: CanvasRenderingContext2D;
    private activeContext: CanvasRenderingContext2D;
    // private canvasStateStack: CanvasState[];
    // private undoneCanvasStateStack: CanvasState[];
    private activeCanvasPosition: CanvasPosition;
    private isDragging: boolean;
    private isSquare: boolean;
    private rectangleTopCorner: Coordinate;
    private currentAction: CanvasAction;
    private clickPosition: Coordinate;
    private isMouseOutOfCanvas: boolean;
    private drawingColor: string;
    private pencilWidth: number;
    private eraserLength: number;

    constructor() {
        this.isDragging = false;
        // this.canvasStateStack = [];
        // this.undoneCanvasStateStack = [];
    }

    setMousePosition(event: MouseEvent, isMouseLeaving: boolean): void {
        this.isMouseOutOfCanvas = isMouseLeaving;
    }

    setDrawingColor(color: string): void {
        this.drawingColor = color;
    }

    setCanvasAction(canvasAction: CanvasAction): void {
        this.currentAction = canvasAction;
    }

    setPencilWidth(width: number): void {
        this.pencilWidth = width;
    }

    setEraserLength(width: number): void {
        this.eraserLength = width;
    }

    // // moved
    // setForegroundContext(canvasPosition: CanvasPosition, foregroundContext: CanvasRenderingContext2D, frontContext: CanvasRenderingContext2D) {
    //     switch (canvasPosition) {
    //         case CanvasPosition.Left:
    //             this.leftForegroundContext = foregroundContext;
    //             this.leftFrontContext = frontContext;
    //             break;
    //         case CanvasPosition.Right:
    //             this.rightForegroundContext = foregroundContext;
    //             this.rightFrontContext = frontContext;
    //             break;
    //     }
    // }

    // disableDragging(): void {
    //     if (this.isDragging) {
    //         this.isDragging = false;
    //         this.saveCurrentCanvasState();
    //     }
    // }

    // // moved
    // getForegroundCanvasElements(): ForegroundCanvasElements {
    //     return { left: this.leftForegroundContext.canvas, right: this.rightForegroundContext.canvas };
    // }

    // // moved
    // swapForegrounds() {
    //     const leftForegroundData: ImageData = this.leftForegroundContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
    //     const rightForegroundData: ImageData = this.rightForegroundContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
    //     this.leftForegroundContext.putImageData(rightForegroundData, 0, 0);
    //     this.rightForegroundContext.putImageData(leftForegroundData, 0, 0);
    //     this.saveCurrentCanvasState();
    // }

    // // moved
    // duplicateForeground(position: CanvasPosition) {
    //     const contextToDuplicate: CanvasRenderingContext2D =
    //         position === CanvasPosition.Left ? this.leftForegroundContext : this.rightForegroundContext;
    //     const contextToOverwrite: CanvasRenderingContext2D =
    //         position === CanvasPosition.Left ? this.rightForegroundContext : this.leftForegroundContext;
    //     const imageDataToDuplicate: ImageData = contextToDuplicate.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
    //     contextToOverwrite.putImageData(imageDataToDuplicate, 0, 0);
    //     this.saveCurrentCanvasState();
    // }

    // // moved
    // redrawForegrounds(canvasState: CanvasState) {
    //     this.resetForeground(CanvasPosition.Both);
    //     this.leftForegroundContext.putImageData(canvasState.left, 0, 0);
    //     this.rightForegroundContext.putImageData(canvasState.right, 0, 0);
    // }

    // // moved
    // undoCanvasOperation() {
    //     if (this.canvasStateStack.length > 0) {
    //         const lastState: CanvasState = this.canvasStateStack.pop() as CanvasState;
    //         this.undoneCanvasStateStack.push(lastState);
    //         if (!this.isCanvasStateNextState(lastState)) {
    //             this.redrawForegrounds(lastState);
    //         } else {
    //             this.undoCanvasOperation();
    //         }
    //     }
    // }

    // // moved
    // redoCanvasOperation() {
    //     if (this.undoneCanvasStateStack.length > 0) {
    //         const lastState: CanvasState = this.undoneCanvasStateStack.pop() as CanvasState;
    //         this.canvasStateStack.push(lastState);
    //         if (!this.isCanvasStateNextState(lastState)) {
    //             this.redrawForegrounds(lastState);
    //         } else {
    //             this.redoCanvasOperation();
    //         }
    //     }
    // }

    // // moved
    // isCanvasStateNextState(nextState: CanvasState): boolean {
    //     const canvasState: CanvasState = this.getCanvasState();
    //     return (
    //         canvasState.left.data.toString() === nextState.left.data.toString() &&
    //         canvasState.right.data.toString() === nextState.right.data.toString()
    //     );
    // }

    // // moved
    // resetForeground(canvasPosition: CanvasPosition) {
    //     switch (canvasPosition) {
    //         case CanvasPosition.Left:
    //             this.resetForegroundContext(this.leftForegroundContext);
    //             this.saveCurrentCanvasState();
    //             break;
    //         case CanvasPosition.Right:
    //             this.resetForegroundContext(this.rightForegroundContext);
    //             this.saveCurrentCanvasState();
    //             break;
    //         case CanvasPosition.Both:
    //             this.resetForegroundContext(this.leftForegroundContext);
    //             this.resetForegroundContext(this.rightForegroundContext);
    //             break;
    //     }
    // }

    // // moved
    // resetForegroundContext(foregroundContext: CanvasRenderingContext2D) {
    //     foregroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
    // }

    // // moved
    // getCanvasState(): CanvasState {
    //     const leftForegroundData: ImageData = this.leftForegroundContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
    //     const rightForegroundData: ImageData = this.rightForegroundContext.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);
    //     return { left: leftForegroundData, right: rightForegroundData };
    // }

    setActiveCanvasPosition(canvasPosition: CanvasPosition): void {
        this.activeCanvasPosition = canvasPosition;
    }

    setActiveContext(context: CanvasRenderingContext2D): void {
        this.activeContext = context;
    }

    setClickPosition(event: MouseEvent) {
        this.clickPosition = { x: event.offsetX, y: event.offsetY };
    }

    isCurrentActionRectangle(): boolean {
        return this.currentAction === CanvasAction.Rectangle;
    }

    isMouseBeingDragged(): boolean {
        return this.isDragging;
    }

    setCanvasOperationStyle() {
        if (this.isCurrentActionRectangle()) {
            this.activeContext.globalCompositeOperation = 'source-over';
            // this.rightForegroundContext.globalCompositeOperation = 'source-over';
            // this.leftForegroundContext.globalCompositeOperation = 'source-over';
            this.activeContext.fillStyle = this.drawingColor;
        } else {
            this.activeContext.lineWidth = this.currentAction === CanvasAction.Pencil ? this.pencilWidth : this.eraserLength;
            this.activeContext.strokeStyle = this.drawingColor;
            switch (this.currentAction) {
                case CanvasAction.Pencil:
                    this.activeContext.globalCompositeOperation = 'source-over';
                    this.activeContext.lineCap = 'round';
                    this.activeContext.lineJoin = 'round';
                    break;
                case CanvasAction.Eraser:
                    this.activeContext.globalCompositeOperation = 'destination-out';
                    this.activeContext.lineCap = 'square';
                    this.activeContext.lineJoin = 'round';
                    break;
            }
        }
    }

    // setCanvasOperation() {
    //     this.undoneCanvasStateStack = [];
    //     this.isDragging = true;
    //     if (this.canvasStateStack.length === 0) {
    //         this.canvasStateStack.push(this.getCanvasState());
    //     }
    //     this.setCanvasOperationStyle();
    // }

    startOperation() {
        this.isDragging = true;
        this.setCanvasOperationStyle();
        if (this.isCurrentActionRectangle()) {
            this.rectangleTopCorner = this.clickPosition;
        } else {
            this.activeContext.beginPath();
            // this.drawLine(event);
            this.drawLine();
        }
    }

    // startCanvasOperation(canvasPosition: CanvasPosition, event: MouseEvent) {
    //     this.setActiveCanvasPosition(canvasPosition);
    //     this.setActiveContext();
    //     this.setCanvasOperation();
    //     this.setClickPosition(event);
    //     if (this.isCurrentActionRectangle()) {
    //         this.rectangleTopCorner = this.clickPosition;
    //     } else {
    //         this.activeContext.beginPath();
    //         this.drawLine(event);
    //     }
    // }

    continueCanvasOperation(canvasPosition: CanvasPosition, event: MouseEvent) {
        this.setClickPosition(event);
        if (this.isDragging && this.activeCanvasPosition === canvasPosition) {
            if (this.isCurrentActionRectangle()) {
                this.drawRectangle();
            } else {
                if (this.isMouseOutOfCanvas) {
                    this.activeContext.closePath();
                    this.activeContext.beginPath();
                    this.isMouseOutOfCanvas = false;
                }
                // this.drawLine(event);
                this.drawLine();
            }
        }
    }

    isMouseDragging(): boolean {
        return this.isDragging;
    }

    getActiveCanvasPosition(): CanvasPosition {
        return this.activeCanvasPosition;
    }

    getActiveContext(): CanvasRenderingContext2D {
        return this.activeContext;
    }

    // stopCanvasOperation(canvasPosition: CanvasPosition, event: MouseEvent) {
    //     this.setClickPosition(event);
    //     if (this.isDragging && this.activeCanvasPosition === canvasPosition) {
    //         if (this.currentAction === CanvasAction.Rectangle) {
    //             this.drawRectangle();
    //             this.foregroundService.copyCanvas(this.activeContext.canvas, canvasPosition);
    //             this.resetActiveCanvas();
    //         } else {
    //             // this.drawLine(event);
    //             this.drawLine();
    //             this.foregroundService.saveCurrentCanvasState();
    //         }
    //         this.isDragging = false;
    //     }
    // }

    stopOperation() {
        this.isDragging = false;
    }
    //     if (this.isDragging) {
    //         if (this.currentAction === CanvasAction.Rectangle) {
    //             this.drawRectangle();
    //             this.foregroundService.copyCanvas(this.activeContext.canvas, this.activeCanvasPosition);
    //             this.resetActiveCanvas();
    //         } else {
    //             // this.drawLine(event);
    //             this.drawLine();
    //             this.foregroundService.saveCurrentCanvasState();
    //         }
    //         this.isDragging = false;
    //     }
    // }

    // // moved
    // copyCanvas(canvas: HTMLCanvasElement, canvasPosition: CanvasPosition) {
    //     switch (canvasPosition) {
    //         case CanvasPosition.Left:
    //             this.leftForegroundContext.drawImage(canvas, 0, 0);
    //             break;
    //         case CanvasPosition.Right:
    //             this.rightForegroundContext.drawImage(canvas, 0, 0);
    //             break;
    //     }
    //     this.saveCurrentCanvasState();
    // }

    // // moved
    // saveCurrentCanvasState() {
    //     this.canvasStateStack.push(this.getCanvasState());
    // }

    drawRectangle() {
        this.activeContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        const rectangleWidth: number = this.clickPosition.x - this.rectangleTopCorner.x;
        const rectangleHeight: number = this.isSquare ? rectangleWidth : this.clickPosition.y - this.rectangleTopCorner.y;
        this.activeContext.fillRect(this.rectangleTopCorner.x, this.rectangleTopCorner.y, rectangleWidth, rectangleHeight);
    }

    drawLine() {
        this.activeContext.lineTo(this.clickPosition.x, this.clickPosition.y);
        this.activeContext.stroke();
    }

    // drawLine(event: MouseEvent) {
    //     this.activeContext.lineTo(event.offsetX, event.offsetY);
    //     this.activeContext.stroke();
    // }

    resetActiveCanvas() {
        this.activeContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
    }

    setSquareMode(isSquare: boolean) {
        if (this.isDragging && this.isCurrentActionRectangle()) {
            this.drawRectangle();
            this.isSquare = isSquare;
        }
    }
}
