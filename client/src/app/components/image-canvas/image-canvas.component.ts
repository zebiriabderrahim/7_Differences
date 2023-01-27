import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/creation-page';
import { ImageService } from '@app/services/image-service/image.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-image-canvas',
    templateUrl: './image-canvas.component.html',
    styleUrls: ['./image-canvas.component.scss'],
})
export class ImageCanvasComponent implements AfterViewInit {
    @Input() position: string;
    @ViewChild('canvas') canvas: ElementRef;
    image: HTMLImageElement;
    context: CanvasRenderingContext2D;

    imageSubscription: Subscription = new Subscription();

    constructor(public imageService: ImageService) {}
    ngAfterViewInit(): void {
        this.canvas.nativeElement.width = IMG_WIDTH;
        this.canvas.nativeElement.height = IMG_HEIGHT;
        this.context = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.image = this.position === 'left' ? this.imageService.originalImage : this.imageService.modifiedImage;
        if (this.position === 'left') {
            this.imageSubscription = this.imageService.originalImageObservable.subscribe(() => {
                this.setCanvasImage(this.imageService.originalImage);
                this.redrawCanvas();
            });
        } else if (this.position === 'right') {
            this.imageSubscription = this.imageService.modifiedImageObservable.subscribe(() => {
                this.setCanvasImage(this.imageService.modifiedImage);
                this.redrawCanvas();
            });
        }
        this.context.drawImage(this.image, 0, 0);
    }

    setCanvasImage(image: HTMLImageElement): void {
        this.context?.drawImage(image, 0, 0);
    }

    redrawCanvas(): void {
        this.context.drawImage(this.image, 0, 0);
    }

    resetCanvas(): void {
        if (this.context) {
            this.context.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        }
    }
}
