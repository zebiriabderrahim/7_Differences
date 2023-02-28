import { Injectable } from '@angular/core';
import { ERASER_COLOR } from '@app/constants/drawing';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { CanvasAction } from '@app/enum/canvas-action';
import { CanvasPosition } from '@app/enum/canvas-position';
import { CanvasOperation } from '@app/interfaces/canvas-operation';
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
    private activeCanvas: CanvasPosition;
    private isDragging: boolean;
    private isSquare: boolean;
    private rectangleTopCorner: Coordinate;
    private currentAction: CanvasAction;
    private clickPosition: Coordinate;

    constructor() {
        this.isDragging = false;
    }

    // TODO: possible to avoid repetition?
    setContext(canvasPosition: CanvasPosition, context: CanvasRenderingContext2D, contextName: string) {
        if (contextName === 'foregroundContext') {
            switch (canvasPosition) {
                case CanvasPosition.Left:
                    this.leftForegroundContext = context;
                    break;
                case CanvasPosition.Right:
                    this.rightForegroundContext = context;
                    break;
            }
        } else if (contextName === 'frontContext') {
            switch (canvasPosition) {
                case CanvasPosition.Left:
                    this.leftFrontContext = context;
                    break;
                case CanvasPosition.Right:
                    this.rightFrontContext = context;
                    break;
            }
        }
    }

    // setFrontContext(canvasPosition: CanvasPosition, context: CanvasRenderingContext2D) {
    //     switch (canvasPosition) {
    //         case CanvasPosition.Left:
    //             this.leftFrontContext = context;
    //             break;
    //         case CanvasPosition.Right:
    //             this.rightFrontContext = context;
    //             break;
    //     }
    // }

    resetForeground(canvasPosition: CanvasPosition) {
        switch (canvasPosition) {
            case CanvasPosition.Left:
                this.leftForegroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
                break;
            case CanvasPosition.Right:
                this.rightForegroundContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
                break;
        }
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

    setCanvasOperationStyle(canvasAction: CanvasAction, color: string, operationWidth: number) {
        if (canvasAction === CanvasAction.Rectangle) {
            this.activeContext.fillStyle = color;
        } else {
            this.activeContext.lineWidth = operationWidth;
            switch (canvasAction) {
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
        this.currentAction = canvasOperation.action;
        this.setActiveCanvas(canvasOperation.position);
        this.setCanvasOperationStyle(canvasOperation.action, canvasOperation.color, canvasOperation.width);
        this.setClickPosition(event);
        if (canvasOperation.action === CanvasAction.Rectangle) {
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
        this.drawRectangle();
        this.isSquare = true;
    }

    disableSquareMode() {
        if (this.isDragging) {
            this.drawRectangle();
        }
        this.isSquare = false;
    }
}
