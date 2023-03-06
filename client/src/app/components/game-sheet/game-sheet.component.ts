/* eslint-disable no-underscore-dangle */
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PlayerNameDialogBoxComponent } from '@app/components/player-name-dialog-box/player-name-dialog-box.component';
import { WaitingForPlayerToJoinComponent } from '@app/components/waiting-player-to-join/waiting-player-to-join.component';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { GameCard } from '@common/game-interfaces';
@Component({
    selector: 'app-game-sheet',
    templateUrl: './game-sheet.component.html',
    styleUrls: ['./game-sheet.component.scss'],
})
export class GameSheetComponent implements OnDestroy, OnInit {
    @Input() game: GameCard;
    constructor(public dialog: MatDialog, public router: Router, private classicSystemService: ClassicSystemService) {
        this.classicSystemService.manageSocket();
    }
    ngOnInit(): void {
        this.classicSystemService.checkIfOneVsOneIsAvailable(this.game._id);
    }

    openDialog() {
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
        this.openDialog()
            .afterClosed()
            .subscribe((isNoClick: boolean) => {
                if (isNoClick) {
                    this.router.navigate(['/game']);
                }
            });
    }

    createOneVsOne() {
        this.openDialog()
            .afterClosed()
            .subscribe((playerName: string) => {
                if (playerName) {
                    const dialogRef = this.dialog.open(WaitingForPlayerToJoinComponent, {
                        data: { gameId: this.game._id },
                        disableClose: true,
                    });
                    dialogRef.afterClosed().subscribe(() => {
                        this.classicSystemService.deleteCreatedOneVsOneRoom(this.game._id);
                        this.router.navigate(['/selection']);
                    });
                    this.classicSystemService.createOneVsOneGame(playerName, this.game._id);
                }
            });
    }

    joinOneVsOne() {
        this.openDialog()
            .afterClosed()
            .subscribe((player2Name: string) => {
                if (player2Name) {
                    this.classicSystemService.updateWaitingPlayerNameList(this.game._id, player2Name);
                }
            });
    }

    isAvailableToJoin() {
        return this.classicSystemService.isRoomAvailable(this.game._id);
    }

    ngOnDestroy(): void {
        this.classicSystemService.disconnect();
    }
}
