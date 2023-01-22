import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Game } from '@app/interfaces/game';
import { PlayerNameDialogBoxComponent } from '../player-name-dialog-box/player-name-dialog-box.component';

@Component({
    selector: 'app-game-sheet',
    templateUrl: './game-sheet.component.html',
    styleUrls: ['./game-sheet.component.scss'],
})
export class GameSheetComponent {
    @Input() game: Game = { id: 1, name: 'test', difficultyLevel: 1, thumbnail: 'test', soloTopTime: [], oneVsOneTopTime: [], differencesCount: 10 };
    playerName: string;
    constructor(public dialog: MatDialog) {}

    openDialog() {
        const dialogRef = this.dialog.open(PlayerNameDialogBoxComponent);
        dialogRef.afterClosed().subscribe((result) => {
            this.playerName = result;
        });
    }
}
