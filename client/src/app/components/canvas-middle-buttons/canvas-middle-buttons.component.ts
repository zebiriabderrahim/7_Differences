import { Component } from '@angular/core';
// import { Component, OnInit } from '@angular/core';
import { CanvasPosition } from '@app/enum/canvas-position';
import { DrawService } from '@app/services/draw-service/draw.service';

@Component({
    selector: 'app-canvas-middle-buttons',
    templateUrl: './canvas-middle-buttons.component.html',
    styleUrls: ['./canvas-middle-buttons.component.scss'],
})
// export class CanvasMiddleButtonsComponent implements OnInit {
export class CanvasMiddleButtonsComponent {
    canvasPosition: typeof CanvasPosition;
    constructor(private readonly drawService: DrawService) {}

    // ngOnInit(): void {}

    swapForegrounds() {
        this.drawService.swapForegrounds();
    }

    duplicateLeftForeground() {
        this.drawService.duplicateForeground(CanvasPosition.Left);
    }

    duplicateRightForeground() {
        this.drawService.duplicateForeground(CanvasPosition.Right);
    }

    undoCanvasOperation() {
        this.drawService.undoCanvasOperation();
    }

    redoCanvasOperation() {
        this.drawService.redoCanvasOperation();
    }
}
