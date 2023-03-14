// Id comes from database to allow _id
/* eslint-disable no-underscore-dangle */
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { JoinedPlayerDialogComponent } from '@app/components/joined-player-dialog/joined-player-dialog.component';
import { PlayerNameDialogBoxComponent } from '@app/components/player-name-dialog-box/player-name-dialog-box.component';
import { WaitingForPlayerToJoinComponent } from '@app/components/waiting-player-to-join/waiting-player-to-join.component';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
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
    private roomAvailabilitySubscription: Subscription;

    // Services are needed for the dialog and dialog needs to talk to the parent component
    // eslint-disable-next-line max-params
    constructor(
        private readonly dialog: MatDialog,
        public router: Router,
        private readonly roomManagerService: RoomManagerService,
        private readonly communicationService: CommunicationService,
    ) {}
    ngOnInit(): void {
        this.roomManagerService.handleRoomEvents();
        this.roomManagerService.checkRoomOneVsOneAvailability(this.game._id);
        this.roomAvailabilitySubscription = this.roomManagerService.oneVsOneRoomsAvailabilityByRoomId$
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

    createSoloRoom(): string {
        let name = '';
        this.openDialog()
            .afterClosed()
            .pipe(filter((playerName) => !!playerName))
            .subscribe((playerName) => {
                this.roomManagerService.createSoloRoom(this.game._id, playerName);
            });
        return name;
    }

    playSolo(): void {
        const name: string = this.createSoloRoom();
        this.roomIdSubscription = this.roomManagerService.roomId$
            .pipe(
                filter((roomId) => !!roomId),
                take(1),
            )
            .subscribe((roomId) => {
                this.router.navigate(['/game', roomId, name]);
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
                    this.roomManagerService.deleteCreatedOneVsOneRoom(this.game._id);
                }
            });
        this.roomManagerService.checkRoomOneVsOneAvailability(this.game._id);
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

    deleteGameCard() {
        this.communicationService.deleteGameById(this.game._id).subscribe(() => {
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                this.router.navigate(['/config']);
            });
        });
    }

    ngOnDestroy(): void {
        this.roomManagerService.disconnect();
        this.roomIdSubscription?.unsubscribe();
        this.roomAvailabilitySubscription?.unsubscribe();
    }
}
