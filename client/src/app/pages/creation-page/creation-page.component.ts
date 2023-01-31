import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ImageValidationDialogComponent } from '@app/components/image-validation-dialog/image-validation-dialog.component';
import { DEFAULT_RADIUS, RADIUS_SIZES } from '@app/constants/creation-page';
import { CanvasPosition } from '@app/enum/canvas-position';
import { DifferenceService } from '@app/services/difference-service/difference.service';
import { ImageService } from '@app/services/image-service/image.service';
import { ValidationService } from '@app/services/validation-service//validation.service';

@Component({
    selector: 'app-root',
    templateUrl: './creation-page.component.html',
    styleUrls: ['./creation-page.component.scss'],
})
export class CreationPageComponent {
    @ViewChild('imageNotSetDialog', { static: true })
    private readonly imageNotSetDialog: TemplateRef<HTMLElement>;
    readonly configRoute: string = '/config';
    canvasPosition: typeof CanvasPosition = CanvasPosition;
    radiusSizes: number[] = RADIUS_SIZES;
    radius: number = DEFAULT_RADIUS;

    constructor(
        public imageService: ImageService,
        public validationService: ValidationService,
        public diffService: DifferenceService,
        private readonly matDialog: MatDialog,
    ) {}

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
                        this.imageService.setBothBackgrounds(image.src);
                    } else {
                        this.matDialog.open(ImageValidationDialogComponent);
                    }
                };
            };
        }
    }

    validateDifferences() {
        if (!this.validationService.areImagesSet()) {
            this.matDialog.open(this.imageNotSetDialog);
        } else {
            this.imageService.validateDifferences(this.radius);
        }
    }
}
