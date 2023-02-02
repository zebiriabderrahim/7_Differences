import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/creation-page';
import { DifferenceService } from '@app/services/difference-service/difference.service';
import { ImageService } from '@app/services/image-service/image.service';

@Component({
    selector: 'app-creation-game-dialog',
    templateUrl: './creation-game-dialog.component.html',
    styleUrls: ['./creation-game-dialog.component.scss'],
})
export class CreationGameDialogComponent implements AfterViewInit {
    @ViewChild('differenceCanvas', { static: true }) differenceCanvas: ElementRef;
    constructor(public imageService: ImageService, private differenceService: DifferenceService) {}

    get displayDifferences(): number {
        return this.differenceService.differencePackages.length;
    }
    ngAfterViewInit(): void {
        this.differenceCanvas.nativeElement.width = IMG_WIDTH;
        this.differenceCanvas.nativeElement.height = IMG_HEIGHT;
        const differenceContext = this.differenceCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.imageService.setDifferenceContext(differenceContext);
    }
}
