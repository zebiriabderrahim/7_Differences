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

    startOperation() {
        this.isDragging = true;
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
        if (this.isDragging && this.activeCanvasPosition === canvasPosition) {
            if (this.isCurrentActionRectangle()) {
                this.drawRectangle();
            } else {
                if (this.isMouseOutOfCanvas) {
                    this.activeContext.closePath();
                    this.activeContext.beginPath();
                    this.isMouseOutOfCanvas = false;
                }
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

    stopOperation() {
        this.isDragging = false;
    }

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
