import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/creation-page';
import { CanvasPosition } from '@app/enum/canvas-position';
import { ImageService } from '@app/services/image-service/image.service';
import { ValidationService } from '@app/services/validation-service/validation.service';

@Component({
    selector: 'app-image-canvas',
    templateUrl: './image-canvas.component.html',
    styleUrls: ['./image-canvas.component.scss'],
})
export class ImageCanvasComponent implements AfterViewInit {
    @Input() position: CanvasPosition;
    @ViewChild('backgroundCanvas') backgroundCanvas: ElementRef;
    context: CanvasRenderingContext2D;

    constructor(public imageService: ImageService, public validationService: ValidationService, public matDialog: MatDialog) {}
    ngAfterViewInit(): void {
        this.backgroundCanvas.nativeElement.width = IMG_WIDTH;
        this.backgroundCanvas.nativeElement.height = IMG_HEIGHT;
        this.context = this.backgroundCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.imageService.setBackgroundContext(this.position, this.context);
    }
}
