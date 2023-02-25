import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { COLORS, DEFAULT_COLOR, DRAW_VALUES, DEFAULT_ERASER_VALUE, DEFAULT_PENCIL_VALUE } from '@app/constants/drawing';
import { CanvasPosition } from '@app/enum/canvas-position';
import { CanvasAction } from '@app/enum/canvas-action';
import { ImageService } from '@app/services/image-service/image.service';
import { DrawService } from '@app/services/draw-service/draw.service';

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

    constructor(private readonly imageService: ImageService, private readonly drawService: DrawService) {
        this.pencilDiameter = DEFAULT_PENCIL_VALUE;
        this.eraserLength = DEFAULT_ERASER_VALUE;
        this.canvasAction = CanvasAction;
        this.actualCanvasAction = CanvasAction.Pencil;
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
        this.drawService.startCanvasOperation(this.position, event, this.actualCanvasAction);
    }

    continueCanvasOperation(event: MouseEvent): void {
        this.drawService.continueCanvasOperation(this.position, event);
    }

    stopCanvasOperation(event: MouseEvent): void {
        this.drawService.stopCanvasOperation(this.position, event);
    }
    onValueChange(value: CanvasAction) {
        console.log('value: ', value);
        this.actualCanvasAction = value;
    }
}
