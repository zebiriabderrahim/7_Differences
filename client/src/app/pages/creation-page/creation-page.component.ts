import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CreationGameDialogComponent } from '@app/components/creation-game-dialog/creation-game-dialog.component';
import { DEFAULT_RADIUS, RADIUS_SIZES } from '@app/constants/difference';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { CanvasPosition } from '@app/enum/canvas-position';
import { GameDetails } from '@app/interfaces/game-interfaces';
import { LEFT_BUTTON } from '@app/constants/constants';
import { CommunicationService } from '@app/services/communication-service/communication.service';
// import { DrawService } from '@app/services/draw-service/draw.service';
import { ImageService } from '@app/services/image-service/image.service';
import { ForegroundService } from '@app/services/foreground-service/foreground.service';

@Component({
    selector: 'app-root',
    templateUrl: './creation-page.component.html',
    styleUrls: ['./creation-page.component.scss'],
})
export class CreationPageComponent implements AfterViewInit {
    @ViewChild('combinedCanvas') combinedCanvas: ElementRef;
    readonly canvasSizes = { width: IMG_WIDTH, height: IMG_HEIGHT };
    readonly configRoute = '/config';
    canvasPosition: typeof CanvasPosition;
    readonly radiusSizes: number[];
    radius: number;

    // Services are needed for the page and page needs to dialog component
    // eslint-disable-next-line max-params
    constructor(
        private readonly imageService: ImageService,
        // private readonly drawService: DrawService,
        private readonly foregroundService: ForegroundService,
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
            this.foregroundService.redoCanvasOperation();
        } else if (event.ctrlKey && event.key === 'z') {
            this.foregroundService.undoCanvasOperation();
        }
    }

    @HostListener('window:mouseup', ['$event'])
    mouseUpEvent(event: MouseEvent) {
        if (event.button === LEFT_BUTTON) {
            this.foregroundService.disableDragging();
            // this.drawService.disableDragging();
        }
    }

    @HostListener('window:mousedown', ['$event'])
    mouseDownEvent(event: MouseEvent) {
        if (event.button === LEFT_BUTTON) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    ngAfterViewInit(): void {
        const combinedContext: CanvasRenderingContext2D = this.combinedCanvas.nativeElement.getContext('2d', { willReadFrequently: true });
        this.imageService.setCombinedContext(combinedContext);
    }

    validateDifferences() {
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
    }

    // swapForegrounds() {
    //     this.drawService.swapForegrounds();
    // }

    // duplicateLeftForeground() {
    //     this.drawService.duplicateForeground(CanvasPosition.Left);
    // }

    // duplicateRightForeground() {
    //     this.drawService.duplicateForeground(CanvasPosition.Right);
    // }

    // undoCanvasOperation() {
    //     this.drawService.undoCanvasOperation();
    // }

    // redoCanvasOperation() {
    //     this.drawService.redoCanvasOperation();
    // }
}
