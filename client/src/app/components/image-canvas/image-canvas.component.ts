import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { COLORS, DEFAULT_COLOR, DRAW_VALUES, DEFAULT_ERASER_VALUE, DEFAULT_PENCIL_VALUE } from '@app/constants/drawing';
import { CanvasPosition } from '@app/enum/canvas-position';
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
    context: CanvasRenderingContext2D;
    readonly canvasSizes = { width: IMG_WIDTH, height: IMG_HEIGHT };
    drawColor: string = DEFAULT_COLOR;
    isColorSelected: boolean = false;
    colors: string[] = COLORS;
    drawValues: number[] = DRAW_VALUES;
    pencilDiameter: number;
    eraserLength: number;
    isDragging: boolean = false;

    constructor(private readonly imageService: ImageService) {
        this.pencilDiameter = DEFAULT_PENCIL_VALUE;
        this.eraserLength = DEFAULT_ERASER_VALUE;
    }
    ngAfterViewInit(): void {
        const backgroundContext: CanvasRenderingContext2D = this.backgroundCanvas.nativeElement.getContext('2d', { willReadFrequently: true });
        this.imageService.setBackgroundContext(this.position, backgroundContext);
    }

    startCanvasOperation(event: MouseEvent): void {
        const canvas = this.foregroundCanvas.nativeElement;
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        context.beginPath();
        context.moveTo(event.offsetX, event.offsetY);
        context.strokeStyle = this.drawColor;
        context.lineWidth = this.pencilDiameter;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.stroke();
        this.isDragging = true;
    }

    continueCanvasOperation(event: MouseEvent): void {
        if (this.isDragging) {
            const canvas = this.foregroundCanvas.nativeElement;
            const context = canvas.getContext('2d') as CanvasRenderingContext2D;
            context.lineTo(event.offsetX, event.offsetY);
            context.strokeStyle = this.drawColor;
            context.lineWidth = this.pencilDiameter;
            context.lineCap = 'round';
            context.lineJoin = 'round';
            context.stroke();
        }
    }

    stopCanvasOperation(event: MouseEvent): void {
        if (this.isDragging) {
            const canvas = this.foregroundCanvas.nativeElement;
            const context = canvas.getContext('2d') as CanvasRenderingContext2D;
            context.lineTo(event.offsetX, event.offsetY);
            context.closePath();
            this.isDragging = false;
        }
    }
}
