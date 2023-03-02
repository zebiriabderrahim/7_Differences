import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
// import { COLORS, DEFAULT_COLOR, DEFAULT_WIDTH, DRAW_VALUES } from '@app/constants/drawing';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
// import { CanvasAction } from '@app/enum/canvas-action';
import { CanvasTopButtonsComponent } from '@app/components/canvas-top-buttons/canvas-top-buttons.component';
import { CanvasPosition } from '@app/enum/canvas-position';
import { CanvasOperation } from '@app/interfaces/canvas-operation';
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
    @ViewChild('frontCanvas') frontCanvas: ElementRef;
    @ViewChild(CanvasTopButtonsComponent) canvasTopButtonsComponent!: CanvasTopButtonsComponent;
    readonly canvasSizes = { width: IMG_WIDTH, height: IMG_HEIGHT };
    operationDetails: CanvasOperation;

    constructor(private readonly imageService: ImageService, private readonly drawService: DrawService) {}

    @HostListener('window:keydown.shift', ['$event'])
    onShiftDown() {
        this.drawService.enableSquareMode();
    }

    @HostListener('window:keyup.shift', ['$event'])
    onShiftUp() {
        this.drawService.disableSquareMode();
    }

    ngAfterViewInit(): void {
        const backgroundContext: CanvasRenderingContext2D = this.backgroundCanvas.nativeElement.getContext('2d', { willReadFrequently: true });
        this.imageService.setBackgroundContext(this.position, backgroundContext);
        const foregroundContext: CanvasRenderingContext2D = this.foregroundCanvas.nativeElement.getContext('2d', { willReadFrequently: true });
        const frontContext: CanvasRenderingContext2D = this.frontCanvas.nativeElement.getContext('2d', { willReadFrequently: true });
        this.drawService.setForegroundContext(this.position, foregroundContext, frontContext);
    }

    resetForeground(): void {
        this.drawService.resetForeground(this.position);
    }

    continueCanvasOperation(event: MouseEvent): void {
        this.drawService.continueCanvasOperation(this.position, event);
    }

    startCanvasOperation(event: MouseEvent): void {
        this.drawService.startCanvasOperation(this.canvasTopButtonsComponent.getOperationDetails(), event);
    }

    stopCanvasOperation(event: MouseEvent): void {
        this.drawService.stopCanvasOperation(this.position, event);
    }
}
