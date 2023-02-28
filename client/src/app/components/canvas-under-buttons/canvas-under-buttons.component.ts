import { Component, ElementRef, Input, TemplateRef, ViewChild } from '@angular/core';
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
    @ViewChild('uploadInput') uploadInput: ElementRef;
    @ViewChild('invalidImageDialog', { static: true })
    private readonly invalidImageDialog: TemplateRef<HTMLElement>;
    readonly canvasPosition: typeof CanvasPosition = CanvasPosition;

    constructor(
        private readonly imageService: ImageService,
        private readonly validationService: ValidationService,
        private readonly matDialog: MatDialog,
    ) {}

    async onSelectFile(event: Event): Promise<void> {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files[0]) {
            const file = target.files[0];
            if (!this.validationService.isImageTypeValid(file)) {
                this.matDialog.open(this.invalidImageDialog);
            } else {
                await this.setImageIfValid(file);
            }
        }
        console.log('select');
        console.log('left', this.imageService['leftBackground'].slice(1,50));
        console.log('right', this.imageService['rightBackground'].slice(1,50));
    }

    async setImageIfValid(file: File): Promise<void> {
        const image = await createImageBitmap(file);
        if (this.validationService.isImageSizeValid(image) && this.validationService.isImageFormatValid(file)) {
            this.imageService.setBackground(this.position, image);
            console.log('after select');
            console.log('left', this.imageService['leftBackground'].slice(1, 50));
            console.log('right', this.imageService['rightBackground'].slice(1, 50));
        } else {
            this.matDialog.open(this.invalidImageDialog);
        }
    }

    resetBackground(): void {
        console.log('reset');
        console.log('left', this.imageService['leftBackground'].slice(1, 50));
        console.log('right', this.imageService['rightBackground'].slice(1, 50));
        this.uploadInput.nativeElement.value = '';
        this.imageService.resetBackground(this.position);
        console.log('after reset');
        console.log('left', this.imageService['leftBackground'].slice(1, 50));
        console.log('right', this.imageService['rightBackground'].slice(1, 50));
    }
}
