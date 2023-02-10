import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PlayerNameDialogBoxComponent } from '@app/components/player-name-dialog-box/player-name-dialog-box.component';
import { GameCard } from '@app/interfaces/game-interfaces';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';

@Component({
    selector: 'app-game-sheet',
    templateUrl: './game-sheet.component.html',
    styleUrls: ['./game-sheet.component.scss'],
})
export class GameSheetComponent {
    @Input() game: GameCard;
    buttonPlay: string;
    buttonJoin: string;
    constructor(public dialog: MatDialog, public router: Router, private classicSystemService: ClassicSystemService) {}

    openDialog() {
        if (this.router.url === '/selection') {
            const dialogConfig = new MatDialogConfig();
            dialogConfig.data = { disableClose: true };
            const dialogRef = this.dialog.open(PlayerNameDialogBoxComponent, dialogConfig);
            dialogRef.afterClosed().subscribe((playerName) => {
                if (playerName) {
                    this.classicSystemService['playerName'].next(playerName);
                    this.classicSystemService['id'].next(this.game.id);
                }
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
