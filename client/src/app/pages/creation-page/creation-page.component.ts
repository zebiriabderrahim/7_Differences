import { Component, TemplateRef, ViewChild } from '@angular/core';
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
    @ViewChild('imageNotSetDialog', { static: true })
    private readonly imageNotSetDialog: TemplateRef<HTMLElement>;
    readonly configRoute: string = '/config';
    canvasPosition: typeof CanvasPosition = CanvasPosition;
    radiusSizes: number[] = RADIUS_SIZES;
    radius: number = DEFAULT_RADIUS;

    constructor(public imageService: ImageService, public validationService: ValidationService, private readonly matDialog: MatDialog) {}

    async onSelectFile(event: Event) {
        if (await this.validationService.isImageUploadValid(event)) {
            this.imageService.setBothBackgrounds(this.validationService.image);
        } else {
            this.matDialog.open(ImageValidationDialogComponent);
        }
    }

    validateDifferences() {
        if (this.imageService.areImagesSet()) {
            const dialogConfig = new MatDialogConfig();
            dialogConfig.data = this.radius;
            this.matDialog.open(CreationGameDialogComponent, dialogConfig);
        } else {
            this.matDialog.open(this.imageNotSetDialog);
        }
    }
}