import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/creation-page';

@Component({
    selector: 'app-image-canvas',
    templateUrl: './image-canvas.component.html',
    styleUrls: ['./image-canvas.component.scss'],
})
export class ImageCanvasComponent implements AfterViewInit, OnChanges {
    @Input() position: string;
    @Input() image: HTMLImageElement;
    @ViewChild('canvas')
    canvas: ElementRef = {} as ElementRef;
    context: CanvasRenderingContext2D;

    ngAfterViewInit(): void {
        this.canvas.nativeElement.width = IMG_WIDTH;
        this.canvas.nativeElement.height = IMG_HEIGHT;
        this.context = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.context?.drawImage(this.image, 0, 0);
    }

    ngOnChanges(changes: SimpleChanges) {
        this.setCanvasImage(changes.image.currentValue);
        // TODO: remove console.log
        // eslint-disable-next-line no-console
        console.log(changes.image.currentValue);
    }

    setCanvasImage(image: HTMLImageElement): void {
        this.context?.drawImage(image, 0, 0);
    }

    resetCanvas(): void {
        if (this.context) {
            this.context.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        }
    }
}
