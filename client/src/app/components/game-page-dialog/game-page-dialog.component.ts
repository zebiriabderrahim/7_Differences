import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
@Component({
    selector: 'app-game-page-dialog',
    templateUrl: './game-page-dialog.component.html',
    styleUrls: ['./game-page-dialog.component.scss'],
})
export class GamePageDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: { action: string; message: string }, public classicSystem: ClassicSystemService) {}
    abandonGame(): void {
        this.classicSystem.abandonGame();
    }
}
