// Id comes from database to allow _id
/* eslint-disable no-underscore-dangle */
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DeleteResetConfirmationDialogComponent } from '@app/components/delete-reset-confirmation-dialog/delete-reset-confirmation-dialog.component';
import { JoinedPlayerDialogComponent } from '@app/components/joined-player-dialog/joined-player-dialog.component';
import { PlayerNameDialogBoxComponent } from '@app/components/player-name-dialog-box/player-name-dialog-box.component';
import { WaitingForPlayerToJoinComponent } from '@app/components/waiting-player-to-join/waiting-player-to-join.component';
import { Actions } from '@app/enum/delete-reset-actions';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { GameModes } from '@common/enums';
import { GameCard, PlayerData } from '@common/game-interfaces';
import { Subscription, filter, take } from 'rxjs';

@Component({
    selector: 'app-game-sheet',
    templateUrl: './game-sheet.component.html',
    styleUrls: ['./game-sheet.component.scss'],
})
export class GameSheetComponent implements OnDestroy, OnInit {
    @Input() game: GameCard;
    url: SafeResourceUrl;
    actions: typeof Actions;
    private isAvailable: boolean;
    private roomSoloIdSubscription: Subscription;
    private roomAvailabilitySubscription: Subscription;
    private roomOneVsOneIdSubscription: Subscription;

    // Services are needed for the dialog and dialog needs to talk to the parent component
    // eslint-disable-next-line max-params
    constructor(
        private readonly dialog: MatDialog,
        public router: Router,
        private readonly roomManagerService: RoomManagerService,
        private sanitizer: DomSanitizer,
    ) {
        this.actions = Actions;
    }
    ngOnInit(): void {
        this.url = this.sanitizer.bypassSecurityTrustUrl('data:image/png;base64,' + this.game.thumbnail);
        this.roomManagerService.checkRoomOneVsOneAvailability(this.game._id);
        this.roomAvailabilitySubscription = this.roomManagerService.oneVsOneRoomsAvailabilityByRoomId$
            .pipe(filter((data) => data.gameId === this.game._id))
            .subscribe((data) => {
                this.isAvailable = data.isAvailableToJoin;
            });
    }

    playSolo(): void {
        this.createSoloRoom();
        this.roomSoloIdSubscription = this.roomManagerService.roomSoloId$.pipe(filter((roomId) => !!roomId)).subscribe(() => {
            this.router.navigate(['/game']);
        });
    }

    createOneVsOne(): void {
        this.roomManagerService.updateRoomOneVsOneAvailability(this.game._id);
        this.openDialog()
            .afterClosed()
            .subscribe((playerName: string) => {
                if (playerName) {
                    const playerPayLoad = { gameId: this.game._id, playerName, gameMode: GameModes.ClassicOneVsOne } as PlayerData;
                    this.roomManagerService.createOneVsOneRoom(playerPayLoad);
                    this.openWaitingDialog(playerName);
                } else {
                    this.roomManagerService.updateRoomOneVsOneAvailability(this.game._id);
                }
            });
    }

    joinOneVsOne(): void {
        this.openDialog()
            .afterClosed()
            .subscribe((player2Name: string) => {
                if (player2Name) {
                    const playerPayLoad = { gameId: this.game._id, playerName: player2Name } as PlayerData;
                    this.roomManagerService.updateWaitingPlayerNameList(playerPayLoad);
                    this.dialog.open(JoinedPlayerDialogComponent, {
                        data: { gameId: this.game._id, player: player2Name },
                        disableClose: true,
                        panelClass: 'dialog',
                    });
                }
            });
    }

    isAvailableToJoin(): boolean {
        return this.isAvailable;
    }

    openConfirmationDialog(actions: Actions): void {
        this.dialog.open(DeleteResetConfirmationDialogComponent, {
            data: { actions, gameId: this.game._id },
            disableClose: true,
            panelClass: 'dialog',
        });
    }

    ngOnDestroy(): void {
        this.roomSoloIdSubscription?.unsubscribe();
        this.roomAvailabilitySubscription?.unsubscribe();
        this.roomOneVsOneIdSubscription?.unsubscribe();
    }

    private openWaitingDialog(playerName: string): void {
        this.roomOneVsOneIdSubscription = this.roomManagerService.roomOneVsOneId$
            .pipe(
                filter((roomId) => !!roomId),
                take(1),
            )
            .subscribe((roomId) => {
                this.dialog.open(WaitingForPlayerToJoinComponent, {
                    data: { roomId, player: playerName, gameId: this.game._id },
                    disableClose: true,
                    panelClass: 'dialog',
                });
            });
    }

    private openDialog() {
        const dialogRef = this.dialog.open(PlayerNameDialogBoxComponent, {
            data: { gameId: this.game._id },
            disableClose: true,
            panelClass: 'dialog',
        });
        return dialogRef;
    }

    private createSoloRoom(): void {
        this.openDialog()
            .afterClosed()
            .pipe(filter((playerName) => !!playerName))
            .subscribe((playerName) => {
                const playerPayLoad = { gameId: this.game._id, playerName, gameMode: GameModes.ClassicSolo } as PlayerData;
                this.roomManagerService.createSoloRoom(playerPayLoad);
            });
    }
}
