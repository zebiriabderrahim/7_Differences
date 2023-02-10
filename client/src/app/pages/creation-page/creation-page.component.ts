import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CreationGameDialogComponent } from '@app/components/creation-game-dialog/creation-game-dialog.component';
import { DEFAULT_RADIUS, RADIUS_SIZES } from '@app/constants/creation-page';
import { CanvasPosition } from '@app/enum/canvas-position';
import { ImageService } from '@app/services/image-service/image.service';

@Component({
    selector: 'app-root',
    templateUrl: './creation-page.component.html',
    styleUrls: ['./creation-page.component.scss'],
})
export class CreationPageComponent {
    @ViewChild('imageNotSetDialog', { static: true })
    private readonly imageNotSetDialog: TemplateRef<HTMLElement>;
    readonly configRoute: string = '/config';
    canvasPosition: typeof CanvasPosition;
    readonly radiusSizes: number[];
    radius: number;

    constructor(private readonly imageService: ImageService, private readonly matDialog: MatDialog) {
        this.radiusSizes = RADIUS_SIZES;
        this.radius = DEFAULT_RADIUS;
        this.canvasPosition = CanvasPosition;
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
