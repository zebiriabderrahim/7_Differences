import { AfterViewInit, Component, ElementRef, HostListener, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CreationGameDialogComponent } from '@app/components/creation-game-dialog/creation-game-dialog.component';
import { DEFAULT_RADIUS, RADIUS_SIZES } from '@app/constants/difference';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { CanvasPosition } from '@app/enum/canvas-position';
import { GameDetails } from '@app/interfaces/game-interfaces';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { DrawService } from '@app/services/draw-service/draw.service';
import { ImageService } from '@app/services/image-service/image.service';

@Component({
    selector: 'app-root',
    templateUrl: './creation-page.component.html',
    styleUrls: ['./creation-page.component.scss'],
})
export class CreationPageComponent implements AfterViewInit {
    @ViewChild('combinedCanvas') combinedCanvas: ElementRef;
    @ViewChild('imageNotSetDialog', { static: true })
    private readonly imageNotSetDialog: TemplateRef<HTMLElement>;
    readonly canvasSizes = { width: IMG_WIDTH, height: IMG_HEIGHT };
    readonly configRoute: string = '/config';
    canvasPosition: typeof CanvasPosition;
    readonly radiusSizes: number[];
    radius: number;

    // Services are needed for the page and page needs to dialog component
    // eslint-disable-next-line max-params
    constructor(
        private readonly imageService: ImageService,
        private readonly drawService: DrawService,
        private readonly matDialog: MatDialog,
        private readonly communicationService: CommunicationService,
        private readonly router: Router,
    ) {
        this.radiusSizes = RADIUS_SIZES;
        this.radius = DEFAULT_RADIUS;
        this.canvasPosition = CanvasPosition;
    }

    @HostListener('window:keydown', ['$event'])
    keyboardEvent(event: KeyboardEvent) {
        if (event.ctrlKey && event.shiftKey && event.key === 'Z') {
            this.drawService.redoCanvasOperation();
        } else if (event.ctrlKey && event.key === 'z') {
            this.drawService.undoCanvasOperation();
        }
    }

    ngAfterViewInit(): void {
        const combinedContext: CanvasRenderingContext2D = this.combinedCanvas.nativeElement.getContext('2d', { willReadFrequently: true });
        this.imageService.setCombinedContext(combinedContext);
    }

    validateDifferences() {
        if (this.imageService.areImagesSet()) {
            const dialogConfig = new MatDialogConfig();
            dialogConfig.data = this.radius;
            this.matDialog
                .open(CreationGameDialogComponent, dialogConfig)
                .afterClosed()
                .subscribe((game: GameDetails) => {
                    if (game) {
                        this.communicationService.postGame(game).subscribe(() => {
                            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                                this.router.navigate(['/config']);
                            });
                        });
                    }
                });
        } else {
            this.matDialog.open(this.imageNotSetDialog);
        }
    }

    swapForegrounds() {
        this.drawService.swapForegrounds();
    }

    duplicateLeftForeground() {
        this.drawService.duplicateLeftForeground();
    }

    duplicateRightForeground() {
        this.drawService.duplicateRightForeground();
    }
}
