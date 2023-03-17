import { AfterViewInit, Component, Input } from '@angular/core';
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
export class CanvasTopButtonsComponent implements AfterViewInit {
    @Input() position: CanvasPosition;
    operationDetails: CanvasOperation;
    selectedCanvasAction: CanvasAction = CanvasAction.Pencil;
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

    ngAfterViewInit(): void {
        this.pencilDiameter = DEFAULT_WIDTH;
        this.eraserLength = DEFAULT_WIDTH;
        this.canvasAction = CanvasAction;
        this.selectedCanvasAction = CanvasAction.Pencil;
        this.setCanvasAction(this.selectedCanvasAction);
        this.setDrawingColor(this.drawColor);
        this.setPencilWidth(this.pencilDiameter);
        this.setEraserLength(this.eraserLength);
    }

    setDrawingColor(color: string): void {
        this.drawColor = color;
        this.isColorSelected = false;
        this.drawService.setDrawingColor(this.drawColor);
    }

    setCanvasAction(canvasAction: CanvasAction): void {
        this.drawService.setCanvasAction(canvasAction);
    }

    setPencilWidth(width: number): void {
        this.drawService.setPencilWidth(width);
    }

    setEraserLength(width: number): void {
        this.drawService.setEraserLength(width);
    }
}
