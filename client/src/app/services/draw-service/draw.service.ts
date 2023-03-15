import { Injectable } from '@angular/core';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { CanvasAction } from '@app/enum/canvas-action';
import { CanvasPosition } from '@app/enum/canvas-position';
import { Coordinate } from '@common/coordinate';

@Injectable({
    providedIn: 'root',
})
export class DrawService {
    private activeContext: CanvasRenderingContext2D;
    private activeCanvasPosition: CanvasPosition;
    private isMouseBeingDragged: boolean;
    private isSquareModeOn: boolean;
    private rectangleTopCorner: Coordinate;
    private currentAction: CanvasAction;
    private clickPosition: Coordinate;
    private isMouseOutOfCanvas: boolean;
    private drawingColor: string;
    private pencilWidth: number;
    private eraserLength: number;

    constructor() {
        this.isMouseBeingDragged = false;
    }

    mouseIsOutOfCanvas(): void {
        this.isMouseOutOfCanvas = false;
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

    isMouseDragged(): boolean {
        return this.isMouseBeingDragged;
    }

    isOperationValid(canvasPosition: CanvasPosition): boolean {
        return this.isMouseBeingDragged && this.activeCanvasPosition === canvasPosition;
    }

    disableMouseDrag(): void {
        if (this.isMouseBeingDragged) {
            this.isMouseBeingDragged = false;
        }
    }

    startOperation() {
        this.isMouseBeingDragged = true;
        this.setCanvasOperationStyle();
        if (this.isCurrentActionRectangle()) {
            this.rectangleTopCorner = this.clickPosition;
        } else {
            this.activeContext.beginPath();
            this.drawLine();
        }
    }

    continueCanvasOperation(canvasPosition: CanvasPosition, event: MouseEvent) {
        this.setClickPosition(event);
        if (this.isOperationValid(canvasPosition)) {
            if (this.isCurrentActionRectangle()) {
                this.drawRectangle();
            } else {
                if (this.isMouseOutOfCanvas) {
                    this.activeContext.closePath();
                    this.activeContext.beginPath();
                    this.mouseIsOutOfCanvas();
                }
                this.drawLine();
            }
        }
    }

    stopOperation() {
        if (this.isCurrentActionRectangle()) {
            this.drawRectangle();
        } else {
            this.drawLine();
        }
        this.disableMouseDrag();
    }

    setSquareMode(squareMode: boolean) {
        if (this.isMouseBeingDragged && this.isCurrentActionRectangle()) {
            this.drawRectangle();
            this.isSquareModeOn = squareMode;
        }
    }

    private setCanvasOperationStyle() {
        switch (this.currentAction) {
            case CanvasAction.Pencil:
                this.activeContext.lineWidth = this.pencilWidth;
                this.activeContext.strokeStyle = this.drawingColor;
                this.activeContext.globalCompositeOperation = 'source-over';
                this.activeContext.lineCap = 'round';
                this.activeContext.lineJoin = 'round';
                break;
            case CanvasAction.Eraser:
                this.activeContext.lineWidth = this.eraserLength;
                this.activeContext.strokeStyle = this.drawingColor;
                this.activeContext.globalCompositeOperation = 'destination-out';
                this.activeContext.lineCap = 'square';
                this.activeContext.lineJoin = 'round';
                break;
            case CanvasAction.Rectangle:
                this.activeContext.globalCompositeOperation = 'source-over';
                this.activeContext.fillStyle = this.drawingColor;
                break;
        }
    }

    private drawRectangle() {
        this.activeContext.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        const rectangleWidth: number = this.clickPosition.x - this.rectangleTopCorner.x;
        const rectangleHeight: number = this.isSquareModeOn ? rectangleWidth : this.clickPosition.y - this.rectangleTopCorner.y;
        this.activeContext.fillRect(this.rectangleTopCorner.x, this.rectangleTopCorner.y, rectangleWidth, rectangleHeight);
    }

    private drawLine() {
        this.activeContext.lineTo(this.clickPosition.x, this.clickPosition.y);
        this.activeContext.stroke();
    }
}
