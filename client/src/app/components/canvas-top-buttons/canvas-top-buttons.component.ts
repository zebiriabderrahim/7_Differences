import { Component, Input } from '@angular/core';
import { COLORS, DEFAULT_COLOR, DEFAULT_WIDTH, DRAW_VALUES } from '@app/constants/drawing';
import { CanvasAction } from '@app/enum/canvas-action';
import { CanvasPosition } from '@app/enum/canvas-position';
import { CanvasOperation } from '@app/interfaces/canvas-operation';
import { DrawService } from '@app/services/draw-service/draw.service';

@Component({
    selector: 'app-canvas-top-buttons',
    templateUrl: './canvas-top-buttons.component.html',
    styleUrls: ['./canvas-top-buttons.component.scss'],
})
export class CanvasTopButtonsComponent {
    @Input() position: CanvasPosition;
    operationDetails: CanvasOperation;
    selectedCanvasAction: CanvasAction;
    isColorSelected: boolean = false;
    canvasAction: typeof CanvasAction;
    pencilDiameter: number;
    eraserLength: number;
    drawValues: number[] = DRAW_VALUES;
    drawColor: string = DEFAULT_COLOR;
    colors: string[] = COLORS;

    constructor(private readonly drawService: DrawService) {
        this.pencilDiameter = DEFAULT_WIDTH;
        this.eraserLength = DEFAULT_WIDTH;
        this.canvasAction = CanvasAction;
        this.selectedCanvasAction = CanvasAction.Pencil;
    }

    getOperationDetails(): CanvasOperation {
        const width: number = this.selectedCanvasAction === CanvasAction.Pencil ? this.pencilDiameter : this.eraserLength;
        this.operationDetails = {
            action: this.selectedCanvasAction,
            position: this.position,
            color: this.drawColor,
            width,
        };
        return this.operationDetails;
    }

    resetForeground(): void {
        this.drawService.resetForeground(this.position);
    }
}
