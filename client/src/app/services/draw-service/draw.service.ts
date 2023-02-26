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
    private activeContext: CanvasRenderingContext2D;
    private activeCanvas: CanvasPosition;
    private isDragging: boolean;
    private rectangleTopCorner: Coordinate;
    private currentAction: CanvasAction;

    constructor() {
        this.isDragging = false;
    }

    // TODO: possible to avoid repetition?
    setForegroundContext(canvasPosition: CanvasPosition, context: CanvasRenderingContext2D) {
        switch (canvasPosition) {
            case CanvasPosition.Left:
                this.leftForegroundContext = context;
                break;
            case CanvasPosition.Right:
                this.rightForegroundContext = context;
                break;
        }
    }

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
                this.activeContext = this.leftForegroundContext;
                break;
            case CanvasPosition.Right:
                this.activeContext = this.rightForegroundContext;
                break;
        }
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
        if (canvasOperation.action === CanvasAction.Rectangle) {
            this.rectangleTopCorner = { x: event.offsetX, y: event.offsetY };
        } else {
            this.activeContext.beginPath();
            this.activeContext.lineTo(event.offsetX, event.offsetY);
            this.activeContext.stroke();
        }
        this.isDragging = true;
    }

    continueCanvasOperation(canvasPosition: CanvasPosition, event: MouseEvent) {
        if (this.isDragging && this.activeCanvas === canvasPosition) {
            if (this.currentAction === CanvasAction.Rectangle) {
                this.activeContext.fillRect(
                    this.rectangleTopCorner.x,
                    this.rectangleTopCorner.y,
                    event.offsetX - this.rectangleTopCorner.x,
                    event.offsetY - this.rectangleTopCorner.y,
                );
            } else {
                this.activeContext.lineTo(event.offsetX, event.offsetY);
                this.activeContext.stroke();
            }
        }
    }

    stopCanvasOperation(canvasPosition: CanvasPosition, event: MouseEvent) {
        if (this.isDragging) {
            if (this.currentAction === CanvasAction.Rectangle) {
                this.activeContext.fillRect(
                    this.rectangleTopCorner.x,
                    this.rectangleTopCorner.y,
                    event.offsetX - this.rectangleTopCorner.x,
                    event.offsetY - this.rectangleTopCorner.y,
                );
            } else {
                this.activeContext.lineTo(event.offsetX, event.offsetY);
                this.activeContext.stroke();
            }
            this.isDragging = false;
        }
    }
}
