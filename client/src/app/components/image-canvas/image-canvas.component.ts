import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/creation-page';
import { ImageService } from '@app/services/image-service/image.service';
import { ValidationService } from '@app/services/validation-service//validation.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-image-canvas',
    templateUrl: './image-canvas.component.html',
    styleUrls: ['./image-canvas.component.scss'],
})
export class ImageCanvasComponent implements AfterViewInit {
    @Input() position: string;
    @ViewChild('canvas') canvas: ElementRef;
    context: CanvasRenderingContext2D;

    imageSubscription: Subscription = new Subscription();

    constructor(public imageService: ImageService, public validationService: ValidationService) {}
    ngAfterViewInit(): void {
        this.canvas.nativeElement.width = IMG_WIDTH;
        this.canvas.nativeElement.height = IMG_HEIGHT;
        this.context = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        if (this.position === 'left') {
            this.imageSubscription = this.imageService.originalImageObservable.subscribe(() => {
                this.setCanvasImage(this.imageService.originalImage);
            });
        } else if (this.position === 'right') {
            this.imageSubscription = this.imageService.modifiedImageObservable.subscribe(() => {
                this.setCanvasImage(this.imageService.modifiedImage);
            });
        }
    }

    setCanvasImage(image: HTMLImageElement): void {
        this.resetCanvas();
        this.context?.drawImage(image, 0, 0);
    }

    onSelectFile(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files[0]) {
            const reader = new FileReader();
            const file = target.files[0];
            reader.readAsDataURL(target.files[0]);
            reader.onload = () => {
                const image = new Image();
                image.src = reader.result as string;
                image.onload = (ev: Event) => {
                    this.validationService.validateImage(file, ev, image.src);
                    if (this.position === 'left') {
                        this.imageService.setOriginalImage(image);
                    } else if (this.position === 'right') {
                        this.imageService.setModifiedImage(image);
                    }
                };
            };
        }
    }

    resetCanvas(): void {
        if (this.context) {
            this.context.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        }
    }
}
