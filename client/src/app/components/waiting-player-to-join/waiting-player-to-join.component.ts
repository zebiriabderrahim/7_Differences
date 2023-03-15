import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { GameCardActions } from '@common/game-interfaces';
import { filter, Subscription } from 'rxjs';

@Component({
    selector: 'app-waiting-player-to-join',
    templateUrl: './waiting-player-to-join.component.html',
    styleUrls: ['./waiting-player-to-join.component.scss'],
})
export class WaitingForPlayerToJoinComponent implements OnInit, OnDestroy {
    playerNames: string[] = [];
    refusedMessage: string;
    countdown: number;
    actions: typeof GameCardActions = GameCardActions;
    private playerNamesSubscription: Subscription;

    // Services are needed for the dialog and dialog needs to talk to the parent component
    // eslint-disable-next-line max-params
    constructor(
        @Inject(MAT_DIALOG_DATA) private data: { roomId: string; player: string; gameId: string },
        private readonly roomManagerService: RoomManagerService,
        private dialogRef: MatDialogRef<WaitingForPlayerToJoinComponent>,
        private readonly router: Router,
    ) {
        this.roomManagerService.handleRoomEvents();
    }
    ngOnInit(): void {
        this.getJoinedPlayerNamesByGameId();
    }

    getJoinedPlayerNamesByGameId(): void {
        this.playerNamesSubscription = this.roomManagerService.joinedPlayerNamesByGameId$
            .pipe(filter((data) => data.gameId === this.data.gameId && !!data.playerNamesList))
            .subscribe((data) => {
                this.playerNames = data.playerNamesList;
            });
    }

    refusePlayer(playerName: string) {
        this.roomManagerService.refusePlayer(this.data.gameId, playerName);
    }

    acceptPlayer(playerName: string) {
        this.playerNames.forEach((player) => {
            if (player !== playerName) {
                this.refusePlayer(player);
            }
        });
        this.roomManagerService.acceptPlayer(this.data.gameId, this.data.roomId, this.data.player);
        this.dialogRef.afterClosed().subscribe(() => {
            this.router.navigate(['/game', this.data.roomId]);
        });
    }

    undoCreateOneVsOneRoom() {
        this.roomManagerService.deleteCreatedOneVsOneRoom(this.data.gameId);
        this.playerNames.forEach((player) => {
            this.refusePlayer(player);
        });
    }

    ngOnDestroy(): void {
        this.playerNamesSubscription?.unsubscribe();
    }
}
