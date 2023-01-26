import { Component, OnInit } from '@angular/core';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/creation-page';

@Component({
    selector: 'app-image-canvas',
    templateUrl: './image-canvas.component.html',
    styleUrls: ['./image-canvas.component.scss'],
})
export class ImageCanvasComponent implements OnInit {
    canvas: HTMLCanvasElement | null;
    context: CanvasRenderingContext2D | null;

    // constructor() {}
    ngOnInit(): void {
        this.canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
        this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.context.fillStyle = 'green';
        this.context.fillRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
    }

    resetCanvas(): void {
        if (this.context) {
            this.context.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
        }
    }
}
