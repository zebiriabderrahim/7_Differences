import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
@Component({
    selector: 'app-solo-game-view-dialog',
    templateUrl: './solo-game-view-dialog.component.html',
    styleUrls: ['./solo-game-view-dialog.component.scss'],
})
export class SoloGameViewDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: { action: string; message: string }, public classicSystem: ClassicSystemService) {}
    abandonGame(): void {
        this.classicSystem.abandonGame();
    }
}
