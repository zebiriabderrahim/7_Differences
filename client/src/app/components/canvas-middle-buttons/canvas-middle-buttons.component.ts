import { Component } from '@angular/core';
import { CanvasPosition } from '@app/enum/canvas-position';
import { ForegroundService } from '@app/services/foreground-service/foreground.service';

@Component({
    selector: 'app-canvas-middle-buttons',
    templateUrl: './canvas-middle-buttons.component.html',
    styleUrls: ['./canvas-middle-buttons.component.scss'],
})
export class CanvasMiddleButtonsComponent {
    constructor(private readonly foregroundService: ForegroundService) {}

    swapForegrounds() {
        this.foregroundService.swapForegrounds();
    }

    duplicateLeftForeground() {
        this.foregroundService.duplicateForeground(CanvasPosition.Left);
    }

    duplicateRightForeground() {
        this.foregroundService.duplicateForeground(CanvasPosition.Right);
    }

    undoCanvasOperation() {
        this.foregroundService.undoCanvasOperation();
    }

    redoCanvasOperation() {
        this.foregroundService.redoCanvasOperation();
    }
}
