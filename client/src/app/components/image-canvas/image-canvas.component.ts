import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
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
    context: CanvasRenderingContext2D;

    constructor(private readonly imageService: ImageService) {}
    ngAfterViewInit(): void {
        this.backgroundCanvas.nativeElement.width = IMG_WIDTH;
        this.backgroundCanvas.nativeElement.height = IMG_HEIGHT;
        this.context = this.backgroundCanvas.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        this.imageService.setBackgroundContext(this.position, this.context);
    }
}
