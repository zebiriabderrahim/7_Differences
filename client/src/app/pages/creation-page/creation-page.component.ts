import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CreationGameDialogComponent } from '@app/components/creation-game-dialog/creation-game-dialog.component';
import { ImageValidationDialogComponent } from '@app/components/image-validation-dialog/image-validation-dialog.component';
import { DEFAULT_RADIUS, RADIUS_SIZES } from '@app/constants/creation-page';
import { CanvasPosition } from '@app/enum/canvas-position';
import { ImageService } from '@app/services/image-service/image.service';
import { ValidationService } from '@app/services/validation-service//validation.service';

@Component({
    selector: 'app-root',
    templateUrl: './creation-page.component.html',
    styleUrls: ['./creation-page.component.scss'],
})
export class CreationPageComponent {
    @Input() radius: number = DEFAULT_RADIUS;
    @ViewChild('imageNotSetDialog', { static: true })
    private readonly imageNotSetDialog: TemplateRef<HTMLElement>;
    readonly configRoute: string = '/config';
    canvasPosition: typeof CanvasPosition = CanvasPosition;
    radiusSizes: number[] = RADIUS_SIZES;

    constructor(public imageService: ImageService, public validationService: ValidationService, private readonly matDialog: MatDialog) {}

    onSelectFile(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files[0]) {
            const reader = new FileReader();
            reader.readAsDataURL(target.files[0]);
            reader.onload = () => {
                const image = new Image();
                image.src = reader.result as string;
                if (this.validationService.isImageTypeValid(image.src)) {
                    image.onload = (ev: Event) => {
                        if (this.validationService.isImageSizeValid(ev) && this.validationService.isImageFormatValid(image.src)) {
                            this.imageService.setBothBackgrounds(image.src);
                        } else {
                            this.matDialog.open(ImageValidationDialogComponent);
                        }
                    };
                } else {
                    this.matDialog.open(ImageValidationDialogComponent);
                }
            };
        }
    }

    validateDifferences() {
        if (!this.validationService.areImagesSet()) {
            this.matDialog.open(this.imageNotSetDialog);
        } else {
            const dialogConfig = new MatDialogConfig();
            dialogConfig.data = this.radius;
            this.matDialog.open(CreationGameDialogComponent, dialogConfig);
        }
    }
}
