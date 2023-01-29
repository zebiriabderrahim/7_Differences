import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PlayerNameDialogBoxComponent } from '@app/components/player-name-dialog-box/player-name-dialog-box.component';
import { GameCard } from '@app/interfaces/game-interfaces';

@Component({
    selector: 'app-game-sheet',
    templateUrl: './game-sheet.component.html',
    styleUrls: ['./game-sheet.component.scss'],
})
export class GameSheetComponent {
    @Input() game: GameCard;

    playerName: string;
    buttonPlay: string;
    buttonJoin: string;
    constructor(public dialog: MatDialog, public router: Router) {}

    openDialog() {
        if (this.router.url === '/selection') {
            const dialogRef = this.dialog.open(PlayerNameDialogBoxComponent);
            dialogRef.afterClosed().subscribe((result) => {
                this.playerName = result;
            });
        }
    }

    navigate() {
        if (this.router.url === '/selection') {
            this.buttonPlay = 'Jouer';
            this.buttonJoin = 'Joindre';
        } else if (this.router.url === '/config') {
            this.buttonPlay = 'Supprimer';
            this.buttonJoin = 'Réinitialier';
        }
    }
}
