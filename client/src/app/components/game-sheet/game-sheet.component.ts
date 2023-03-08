/* eslint-disable no-underscore-dangle */
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PlayerNameDialogBoxComponent } from '@app/components/player-name-dialog-box/player-name-dialog-box.component';
import { WaitingHostToDecideComponent } from '@app/components/waiting-host-to-decide/waiting-host-to-decide.component';
import { WaitingForPlayerToJoinComponent } from '@app/components/waiting-player-to-join/waiting-player-to-join.component';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { GameCard } from '@common/game-interfaces';

@Component({
    selector: 'app-game-sheet',
    templateUrl: './game-sheet.component.html',
    styleUrls: ['./game-sheet.component.scss'],
})
export class GameSheetComponent implements OnDestroy, OnInit {
    @Input() game: GameCard;

    // Services are needed for the dialog and dialog needs to talk to the parent component
    // eslint-disable-next-line max-params
    constructor(
        public dialog: MatDialog,
        public router: Router,
        private classicSystemService: ClassicSystemService,
        private communicationService: CommunicationService,
    ) {
        this.classicSystemService.manageSocket();
    }
    ngOnInit(): void {
        this.classicSystemService.checkIfOneVsOneIsAvailable(this.game._id);
    }

    openNameDialog() {
        const dialogRef = this.dialog.open(PlayerNameDialogBoxComponent, { disableClose: true });
        dialogRef.afterClosed().subscribe((playerName) => {
            if (playerName) {
                this.classicSystemService['playerName'].next(playerName);
                this.classicSystemService['id'].next(this.game._id);
            }
        });
        return dialogRef;
    }

    playSolo() {
        this.openNameDialog()
            .afterClosed()
            .subscribe((playerName: string) => {
                if (playerName) {
                    this.router.navigate(['/game']);
                }
            });
    }

    createOneVsOne() {
        this.openNameDialog()
            .afterClosed()
            .subscribe((playerName: string) => {
                if (playerName) {
                    const dialogRef = this.dialog.open(WaitingForPlayerToJoinComponent, {
                        data: { gameId: this.game._id },
                        disableClose: true,
                    });
                    dialogRef.afterClosed().subscribe(() => {
                        this.router.navigate(['/game/host']);
                    });
                }
            });
    }

    joinOneVsOne() {
        this.openNameDialog()
            .afterClosed()
            .subscribe((player2Name: string) => {
                if (player2Name) {
                    this.classicSystemService.updateWaitingPlayerNameList(this.game._id, player2Name);
                    const dialogRef = this.dialog.open(WaitingHostToDecideComponent, {
                        data: { gameId: this.game._id },
                        disableClose: true,
                    });
                    dialogRef.afterClosed().subscribe(() => {
                        this.router.navigate(['/game/join']);
                    });
                }
            });
    }

    isAvailableToJoin() {
        return this.classicSystemService.isRoomAvailable(this.game._id);
    }

    ngOnDestroy(): void {
        this.classicSystemService.disconnect();
    }

    deleteGameCard() {
        this.communicationService.deleteGameById(this.game._id).subscribe(() => {
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                this.router.navigate(['/config']);
            });
        });
    }
}
