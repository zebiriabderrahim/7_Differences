import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PlayerNameDialogBoxComponent } from '@app/components/player-name-dialog-box/player-name-dialog-box.component';
import { GameCard } from '@app/interfaces/game-interfaces';
import { GameCardService } from '@app/services/gamecard-service/gamecard.service';

@Component({
    selector: 'app-game-sheet',
    templateUrl: './game-sheet.component.html',
    styleUrls: ['./game-sheet.component.scss'],
})
export class GameSheetComponent {
    @Input() game: GameCard;
    buttonPlay: string;
    buttonJoin: string;
    constructor(public dialog: MatDialog, private gameCard: GameCardService) {}

    openDialog() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = { disableClose: true };
        const dialogRef = this.dialog.open(PlayerNameDialogBoxComponent, dialogConfig);
        dialogRef.afterClosed().subscribe((playerName) => {
            if (playerName.trim().length !== 0 && playerName !== undefined) {
                this.gameCard.redirection(this.game.id);
                dialogConfig.data = { playerName, game: this.game };
            }
        });
    }
}
