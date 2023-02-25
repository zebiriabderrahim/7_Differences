import { Injectable } from '@angular/core';
import { DEFAULT_COLOR, DEFAULT_PENCIL_VALUE, ERASER_COLOR } from '@app/constants/drawing';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { CanvasAction } from '@app/enum/canvas-action';
import { CanvasPosition } from '@app/enum/canvas-position';

@Injectable({
    providedIn: 'root',
})
export class DrawService {
    private leftForegroundContext: CanvasRenderingContext2D;
    private rightForegroundContext: CanvasRenderingContext2D;
    private activeContext: CanvasRenderingContext2D;
    private activeCanvas: CanvasPosition;
    private operationWidth: number;
    private isDragging: boolean;
    // private drawingColor: string;

    constructor() {
        this.isDragging = false;
        // this.drawingColor = 'black';
        this.operationWidth = DEFAULT_PENCIL_VALUE;
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

    setCanvasOperationStyle(canvasAction: CanvasAction) {
        this.activeContext.lineWidth = this.operationWidth;
        switch (canvasAction) {
            case CanvasAction.Pencil:
                this.activeContext.strokeStyle = DEFAULT_COLOR;
                this.activeContext.lineCap = 'round';
                this.activeContext.lineJoin = 'round';
                break;
            case CanvasAction.Eraser:
                this.activeContext.strokeStyle = ERASER_COLOR;
                this.activeContext.lineCap = 'square';
                this.activeContext.lineJoin = 'miter';
                break;
        }
    }

    startCanvasOperation(canvasPosition: CanvasPosition, event: MouseEvent, canvasAction: CanvasAction) {
        this.setActiveCanvas(canvasPosition);
        this.setCanvasOperationStyle(canvasAction);
        this.activeContext.beginPath();
        this.activeContext.moveTo(event.offsetX, event.offsetY);
        this.activeContext.stroke();
        this.isDragging = true;
    }

    continueCanvasOperation(canvasPosition: CanvasPosition, event: MouseEvent) {
        if (this.isDragging && this.activeCanvas === canvasPosition) {
            this.activeContext.lineTo(event.offsetX, event.offsetY);
            this.activeContext.stroke();
        }
    }

    stopCanvasOperation(canvasPosition: CanvasPosition, event: MouseEvent) {
        if (this.isDragging) {
            this.activeContext.lineTo(event.offsetX, event.offsetY);
            this.activeContext.closePath();
            this.isDragging = false;
        }
    }
}
