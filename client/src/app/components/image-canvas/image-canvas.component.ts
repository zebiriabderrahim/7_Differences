import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ImageValidationDialogComponent } from '@app/components/image-validation-dialog/image-validation-dialog.component';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/creation-page';
import { CanvasPosition } from '@app/enum/canvas-position';
import { ImageService } from '@app/services/image-service/image.service';
import { ValidationService } from '@app/services/validation-service/validation.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-image-canvas',
    templateUrl: './image-canvas.component.html',
    styleUrls: ['./image-canvas.component.scss'],
})
export class ImageCanvasComponent implements AfterViewInit {
    @Input() position: CanvasPosition;
    @ViewChild('canvas') canvas: ElementRef;
    context: CanvasRenderingContext2D;

    imageSubscription: Subscription = new Subscription();

    constructor(public imageService: ImageService, public validationService: ValidationService, public dialog: MatDialog) {}
    ngAfterViewInit(): void {
        this.canvas.nativeElement.width = IMG_WIDTH;
        this.canvas.nativeElement.height = IMG_HEIGHT;
        this.context = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        if (this.position === CanvasPosition.Left) {
            this.imageSubscription = this.imageService.originalImageObservable.subscribe(() => {
                this.setCanvasImage(this.imageService.originalImage);
            });
        } else if (this.position === CanvasPosition.Right) {
            this.imageSubscription = this.imageService.modifiedImageObservable.subscribe(() => {
                this.setCanvasImage(this.imageService.modifiedImage);
            });
        }
    }

    setCanvasImage(image: string): void {
        this.resetCanvas();
        if (image === '') {
            this.context?.drawImage(new Image(), 0, 0);
        } else {
            const imageToDraw = new Image();
            imageToDraw.src = image;
            this.context?.drawImage(imageToDraw, 0, 0);
        }
    }

    onSelectFile(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files[0]) {
            const reader = new FileReader();
            reader.readAsDataURL(target.files[0]);
            reader.onload = () => {
                const image = new Image();
                image.src = reader.result as string;
                image.onload = (ev: Event) => {
                    if (this.validationService.isImageValid(ev, image.src)) {
                        this.imageService.setBackground(this.position, image.src);
                    } else {
                        this.dialog.open(ImageValidationDialogComponent);
                    }
                };
            };
        }
    }

    resetCanvas(): void {
        this.context?.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
    }

    removeBackground(): void {
        this.imageService.removeBackground(this.position);
    }
}
