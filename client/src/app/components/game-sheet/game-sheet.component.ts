/* eslint-disable no-underscore-dangle */
import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PlayerNameDialogBoxComponent } from '@app/components/player-name-dialog-box/player-name-dialog-box.component';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { GameCard } from '@common/game-interfaces';

@Component({
    selector: 'app-game-sheet',
    templateUrl: './game-sheet.component.html',
    styleUrls: ['./game-sheet.component.scss'],
})
export class GameSheetComponent {
    @Input() game: GameCard;
    constructor(
        public dialog: MatDialog,
        public router: Router,
        private classicSystemService: ClassicSystemService,
        private communicationService: CommunicationService,
    ) {}

    openDialog() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = { disableClose: true };
        const dialogRef = this.dialog.open(PlayerNameDialogBoxComponent, dialogConfig);
        dialogRef.afterClosed().subscribe((playerName) => {
            if (playerName) {
                this.classicSystemService['playerName'].next(playerName);
                this.classicSystemService['id'].next(this.game._id);
            }
        });
    }

    deleteGameCard() {
        this.communicationService.deleteGameById(this.game._id).subscribe(() => {
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                this.router.navigate(['/config']);
            });
        });
    }
}
