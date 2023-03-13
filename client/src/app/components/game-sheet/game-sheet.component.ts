/* eslint-disable no-underscore-dangle */
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { JoinedPlayerDialogComponent } from '@app/components/joined-player-dialog/joined-player-dialog.component';
import { PlayerNameDialogBoxComponent } from '@app/components/player-name-dialog-box/player-name-dialog-box.component';
import { WaitingForPlayerToJoinComponent } from '@app/components/waiting-player-to-join/waiting-player-to-join.component';
import { RoomManagerService } from '@app/services/room-manager.service';
import { GameCard } from '@common/game-interfaces';
import { filter, Subscription, take } from 'rxjs';

@Component({
    selector: 'app-game-sheet',
    templateUrl: './game-sheet.component.html',
    styleUrls: ['./game-sheet.component.scss'],
})
export class GameSheetComponent implements OnDestroy, OnInit {
    @Input() game: GameCard;
    private isAvailable: boolean;
    private roomIdSubscription: Subscription;
    private oneVsOneRoomsAvailabilityByRoomIdSubscription: Subscription;
    constructor(private readonly dialog: MatDialog, public router: Router, private readonly roomManagerService: RoomManagerService) {
        this.roomManagerService.handleRoomEvents();
    }
    ngOnInit(): void {
        this.roomManagerService.checkRoomOneVsOneAvailability(this.game._id);
        this.oneVsOneRoomsAvailabilityByRoomIdSubscription = this.roomManagerService.oneVsOneRoomsAvailabilityByRoomId$
            .pipe(filter((data) => data.gameId === this.game._id))
            .subscribe((data) => {
                this.isAvailable = data.isAvailableToJoin;
            });
    }

    openDialog() {
        const dialogRef = this.dialog.open(PlayerNameDialogBoxComponent, {
            data: { gameId: this.game._id },
            disableClose: true,
        });
        return dialogRef;
    }

    createSoloRoom() {
        this.openDialog()
            .afterClosed()
            .subscribe((playerName) => {
                if (playerName) {
                    this.roomManagerService.createSoloRoom(this.game._id, playerName);
                }
            });
    }

    playSolo(): void {
        this.createSoloRoom();
        this.roomIdSubscription = this.roomManagerService.roomId$
            .pipe(
                filter((roomId) => !!roomId),
                take(1),
            )
            .subscribe((roomId) => {
                this.router.navigate(['/game', roomId]);
            });
    }

    createOneVsOne(): void {
        this.roomManagerService.updateRoomOneVsOneAvailability(this.game._id);
        this.openDialog()
            .afterClosed()
            .subscribe((playerName: string) => {
                if (playerName) {
                    this.roomManagerService.createOneVsOneRoom(this.game._id);
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
                    this.roomManagerService.updateWaitingPlayerNameList(this.game._id, player2Name);
                    this.dialog.open(JoinedPlayerDialogComponent, {
                        data: { gameId: this.game._id, player: player2Name },
                        disableClose: true,
                    });
                }
            });
    }

    openWaitingDialog(playerName: string): void {
        this.roomIdSubscription = this.roomManagerService.roomId$
            .pipe(
                filter((roomId) => !!roomId),
                take(1),
            )
            .subscribe((roomId) => {
                this.dialog.open(WaitingForPlayerToJoinComponent, {
                    data: { roomId, player: playerName, gameId: this.game._id },
                    disableClose: true,
                });
            });
    }

    isAvailableToJoin(): boolean {
        return this.isAvailable;
    }

    ngOnDestroy(): void {
        this.roomManagerService.disconnect();
        if (this.roomIdSubscription) {
            this.roomIdSubscription.unsubscribe();
        }
        if (this.oneVsOneRoomsAvailabilityByRoomIdSubscription) {
            this.oneVsOneRoomsAvailabilityByRoomIdSubscription.unsubscribe();
        }
    }
}
