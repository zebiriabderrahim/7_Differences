import { Component, ElementRef, Input, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanvasPosition } from '@app/enum/canvas-position';
import { ForegroundService } from '@app/services/foreground-service/foreground.service';
import { ImageService } from '@app/services/image-service/image.service';
import { ValidationService } from '@app/services/validation-service/validation.service';

@Component({
    selector: 'app-canvas-under-buttons',
    templateUrl: './canvas-under-buttons.component.html',
    styleUrls: ['./canvas-under-buttons.component.scss'],
})
export class CanvasUnderButtonsComponent {
    @Input() canvasPositionType: CanvasPosition;
    @ViewChild('uploadInput') uploadInput: ElementRef;
    @ViewChild('invalidImageDialog', { static: true })
    private readonly invalidImageDialog: TemplateRef<HTMLElement>;
    readonly canvasPosition: typeof CanvasPosition = CanvasPosition;

    // Services are needed for the dialog and dialog needs to talk to the parent component
    // eslint-disable-next-line max-params
    constructor(
        private readonly imageService: ImageService,
        private readonly foregroundService: ForegroundService,
        private readonly validationService: ValidationService,
        private readonly matDialog: MatDialog,
    ) {}

    async onSelectFile(event: Event): Promise<void> {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files[0]) {
            const file = target.files[0];
            if (this.validationService.isImageValid(file, target)) {
                this.imageService.setBackground(this.canvasPositionType, await createImageBitmap(file));
                this.uploadInput.nativeElement.value = '';
            } else {
                this.matDialog.open(this.invalidImageDialog);
            }
        }
    }

    resetBackground(): void {
        this.imageService.resetBackground(this.canvasPositionType);
    }

    resetForeground(): void {
        this.foregroundService.resetForeground(this.canvasPositionType);
    }
}
