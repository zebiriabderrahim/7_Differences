import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BMP_HEADER_OFFSET, FORMAT_IMAGE, IMG_HEIGHT, IMG_TYPE, IMG_WIDTH } from '@app/constants/creation-page';
import { CanvasPosition } from '@app/enum/canvas-position';
import { ImageService } from '@app/services/image-service/image.service';
import { Buffer } from 'buffer';

@Component({
    selector: 'app-canvas-under-buttons',
    templateUrl: './canvas-under-buttons.component.html',
    styleUrls: ['./canvas-under-buttons.component.scss'],
})
export class CanvasUnderButtonsComponent {
    @Input() position: CanvasPosition;
    @ViewChild('invalidImageDialog', { static: true })
    private readonly invalidImageDialog: TemplateRef<HTMLElement>;
    canvasPosition: typeof CanvasPosition;
    constructor(public imageService: ImageService, public matDialog: MatDialog) {
        this.canvasPosition = CanvasPosition;
    }

    isImageTypeValid(imageDescription: string): boolean {
        return imageDescription.includes(IMG_TYPE);
    }

    isImageSizeValid(event: Event): boolean {
        const target = event.target as HTMLInputElement;
        return target.width === IMG_WIDTH && target.height === IMG_HEIGHT;
    }

    isImageFormatValid(imageDescription: string): boolean {
        const imageData = imageDescription.split(',')[1];
        const descriptionBuffer = Uint8Array.from(Buffer.from(imageData, 'base64'));
        return descriptionBuffer[BMP_HEADER_OFFSET] === FORMAT_IMAGE;
    }

    setImage(event: Event): void {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files[0]) {
            const reader = new FileReader();
            reader.readAsDataURL(target.files[0]);
            reader.onload = () => {
                const image = new Image();
                image.src = reader.result as string;
                this.setImageIfValid(image);
            };
        }
    }

    setImageIfValid(image: HTMLImageElement): void {
        if (this.isImageTypeValid(image.src)) {
            image.onload = (ev: Event) => {
                if (this.isImageSizeValid(ev) && this.isImageFormatValid(image.src)) {
                    this.imageService.setBackground(this.position, image.src);
                } else {
                    this.matDialog.open(this.invalidImageDialog);
                }
            };
        } else {
            this.matDialog.open(this.invalidImageDialog);
        }
    }

    resetBackground(): void {
        if (this.position === CanvasPosition.Both) {
            this.imageService.resetBothBackgrounds();
        } else {
            this.imageService.resetBackground(this.position);
        }
    }
}
