import { Component } from '@angular/core';

@Component({
    selector: 'app-solo-game-view',
    templateUrl: './solo-game-view.component.html',
    styleUrls: ['./solo-game-view.component.scss'],
})
export class SoloGameViewComponent {
    isFinished: boolean = false;
    finish(): void {
        this.isFinished = true;
    }
}
