import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { COLORS, DEFAULT_COLOR, DEFAULT_WIDTH, DRAW_VALUES } from '@app/constants/drawing';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { CanvasOperation } from '@app/interfaces/canvas-operation';
import { CanvasAction } from '@app/enum/canvas-action';
import { CanvasPosition } from '@app/enum/canvas-position';
import { DrawService } from '@app/services/draw-service/draw.service';
import { ImageService } from '@app/services/image-service/image.service';

@Component({
    selector: 'app-image-canvas',
    templateUrl: './image-canvas.component.html',
    styleUrls: ['./image-canvas.component.scss'],
})
export class ImageCanvasComponent implements AfterViewInit {
    @Input() position: CanvasPosition;
    @ViewChild('backgroundCanvas') backgroundCanvas: ElementRef;
    @ViewChild('foregroundCanvas') foregroundCanvas: ElementRef;
    readonly canvasSizes = { width: IMG_WIDTH, height: IMG_HEIGHT };
    canvasAction: typeof CanvasAction;
    actualCanvasAction: CanvasAction;
    drawColor: string = DEFAULT_COLOR;
    isColorSelected: boolean = false;
    colors: string[] = COLORS;
    drawValues: number[] = DRAW_VALUES;
    pencilDiameter: number;
    eraserLength: number;
    operationWidth: number;

    constructor(private readonly imageService: ImageService, private readonly drawService: DrawService) {
        this.pencilDiameter = DEFAULT_WIDTH;
        this.eraserLength = DEFAULT_WIDTH;
        this.canvasAction = CanvasAction;
        this.actualCanvasAction = CanvasAction.Pencil;
        this.operationWidth = this.pencilDiameter;
    }

    ngAfterViewInit(): void {
        const backgroundContext: CanvasRenderingContext2D = this.backgroundCanvas.nativeElement.getContext('2d', { willReadFrequently: true });
        this.imageService.setBackgroundContext(this.position, backgroundContext);
        const foregroundContext: CanvasRenderingContext2D = this.foregroundCanvas.nativeElement.getContext('2d', { willReadFrequently: true });
        this.drawService.setForegroundContext(this.position, foregroundContext);
    }

    resetForeground(): void {
        this.drawService.resetForeground(this.position);
    }

    startCanvasOperation(event: MouseEvent): void {
        const canvasOperation: CanvasOperation = {
            action: this.actualCanvasAction,
            position: this.position,
            color: this.drawColor,
            width: this.operationWidth,
        };
        this.drawService.startCanvasOperation(canvasOperation, event);
    }

    continueCanvasOperation(event: MouseEvent): void {
        this.drawService.continueCanvasOperation(this.position, event);
    }

    stopCanvasOperation(event: MouseEvent): void {
        this.drawService.stopCanvasOperation(this.position, event);
    }

    onValueChange(value: CanvasAction) {
        this.actualCanvasAction = value;
        switch (value) {
            case CanvasAction.Pencil:
                this.operationWidth = this.pencilDiameter;
                break;
            case CanvasAction.Eraser:
                this.operationWidth = this.eraserLength;
                break;
        }
    }

    onWidthChange(value: number) {
        this.operationWidth = value;
    }
}
