import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { LEFT_BUTTON } from '@app/constants/constants';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { CanvasPosition } from '@app/enum/canvas-position';
import { DrawService } from '@app/services/draw-service/draw.service';
import { ForegroundService } from '@app/services/foreground-service/foreground.service';
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
    readonly canvasSizes = { width: IMG_WIDTH, height: IMG_HEIGHT };

    constructor(
        private readonly imageService: ImageService,
        private readonly drawService: DrawService,
        private readonly foregroundService: ForegroundService,
    ) {}

    @HostListener('window:keydown.shift', ['$event'])
    onShiftDown() {
        this.drawService.setSquareMode(true);
    }

    @HostListener('window:keyup.shift', ['$event'])
    onShiftUp() {
        this.drawService.setSquareMode(false);
    }

    ngAfterViewInit(): void {
        const backgroundContext: CanvasRenderingContext2D = this.backgroundCanvas.nativeElement.getContext('2d', { willReadFrequently: true });
        this.imageService.setBackgroundContext(this.position, backgroundContext);
        const foregroundContext: CanvasRenderingContext2D = this.foregroundCanvas.nativeElement.getContext('2d', { willReadFrequently: true });
        const frontContext: CanvasRenderingContext2D = this.frontCanvas.nativeElement.getContext('2d', { willReadFrequently: true });
        this.foregroundService.setForegroundContext(this.position, foregroundContext, frontContext);
    }

    onMouseLeavingCanvas(event: MouseEvent): void {
        if (event.button === LEFT_BUTTON) {
            this.drawService.mouseIsOutOfCanvas();
        }
    }

    continueCanvasOperation(event: MouseEvent): void {
        this.drawService.continueCanvasOperation(this.position, event);
    }

    startCanvasOperation(event: MouseEvent): void {
        this.foregroundService.startForegroundOperation(this.position, event);
    }

    stopCanvasOperation(event: MouseEvent): void {
        this.foregroundService.stopForegroundOperation(this.position, event);
    }
}
