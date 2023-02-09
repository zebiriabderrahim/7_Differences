import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanvasPosition } from '@app/enum/canvas-position';
import { ImageService } from '@app/services/image-service/image.service';
import { ValidationService } from '@app/services/validation-service/validation.service';

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
    constructor(public imageService: ImageService, public validationService: ValidationService, public matDialog: MatDialog) {
        this.canvasPosition = CanvasPosition;
    }

    onSelectFile(event: Event): void {
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
        if (!this.validationService.isImageTypeValid(image.src)) {
            this.matDialog.open(this.invalidImageDialog);
            return;
        }
        image.onload = (ev: Event) => {
            if (this.validationService.isImageSizeValid(ev) && this.validationService.isImageFormatValid(image.src)) {
                this.imageService.setBackground(this.position, image.src);
            } else {
                this.matDialog.open(this.invalidImageDialog);
            }
        };
    }

    resetBackground(): void {
        if (this.position === CanvasPosition.Both) {
            this.imageService.resetBothBackgrounds();
        } else {
            this.imageService.resetBackground(this.position);
        }
    }
}
