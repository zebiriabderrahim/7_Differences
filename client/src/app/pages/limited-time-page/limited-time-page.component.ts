import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NoGameAvailableDialogComponent } from '@app/components/no-game-available-dialog/no-game-available-dialog.component';
import { PlayerNameDialogBoxComponent } from '@app/components/player-name-dialog-box/player-name-dialog-box.component';
import { WaitingForPlayerToJoinComponent } from '@app/components/waiting-player-to-join/waiting-player-to-join.component';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { GameModes } from '@common/enums';
import { PlayerData } from '@common/game-interfaces';
import { Subscription, filter } from 'rxjs';

@Component({
    selector: 'app-limited-time-page',
    templateUrl: './limited-time-page.component.html',
    styleUrls: ['./limited-time-page.component.scss'],
})
export class LimitedTimePageComponent implements OnDestroy, OnInit {
    gameModes: typeof GameModes;
    private hasNoGameAvailableSubscription: Subscription;
    private roomIdSubscription: Subscription;
    private isLimitedCoopRoomAvailableSubscription: Subscription;
    private playerName: string;
    private isLimitedCoopRoomAvailable: boolean;
    private isStartingGame: boolean;
    constructor(public router: Router, private readonly roomManagerService: RoomManagerService, private readonly dialog: MatDialog) {
        this.gameModes = GameModes;
        this.isStartingGame = false;
        this.isLimitedCoopRoomAvailable = false;
        this.roomManagerService.handleRoomEvents();
        this.openDialog();
    }

    ngOnInit(): void {
        this.handleJoinCoopRoom();
        this.handleNoGameAvailable();
    }

    playLimited(gameMode: GameModes) {
        if (this.isStartingGame) return;
        this.isStartingGame = true;
        const playerPayLoad = { playerName: this.playerName, gameMode } as PlayerData;
        if (gameMode === GameModes.LimitedSolo) {
            this.roomManagerService.createLimitedRoom(playerPayLoad);
            this.redirectToGamePage(gameMode);
        } else if (gameMode === GameModes.LimitedCoop) {
            this.roomManagerService.checkIfAnyCoopRoomExists(playerPayLoad);
            this.redirectToGamePage(gameMode);
        }
    }

    ngOnDestroy(): void {
        this.roomIdSubscription?.unsubscribe();
        this.isLimitedCoopRoomAvailableSubscription?.unsubscribe();
        this.hasNoGameAvailableSubscription?.unsubscribe();
        this.roomManagerService.removeAllListeners();
    }

    private openDialog() {
        this.dialog
            .open(PlayerNameDialogBoxComponent, { disableClose: true, panelClass: 'dialog' })
            .afterClosed()
            .subscribe((playerName) => {
                if (playerName) {
                    this.playerName = playerName;
                } else {
                    this.router.navigate(['/']);
                }
            });
    }

    private redirectToGamePage(gameMode: GameModes) {
        this.roomIdSubscription?.unsubscribe();
        this.roomIdSubscription = this.roomManagerService.roomLimitedId$.pipe(filter((roomId) => !!roomId)).subscribe((roomId) => {
            if (gameMode === GameModes.LimitedSolo) {
                this.router.navigate(['/game']);
            } else if (gameMode === GameModes.LimitedCoop && !this.isLimitedCoopRoomAvailable) {
                this.openWaitingDialog(roomId);
                this.isStartingGame = false;
            }
        });
    }

    private openWaitingDialog(roomId: string) {
        this.dialog.open(WaitingForPlayerToJoinComponent, {
            data: { roomId, isLimited: true },
            disableClose: true,
            panelClass: 'dialog',
        });
    }

    private handleJoinCoopRoom() {
        this.isLimitedCoopRoomAvailableSubscription = this.roomManagerService.isLimitedCoopRoomAvailable$
            .pipe(filter((isRoomAvailable) => isRoomAvailable))
            .subscribe(() => {
                this.router.navigate(['/game']);
                this.dialog.closeAll();
            });
    }

    private handleNoGameAvailable() {
        this.hasNoGameAvailableSubscription = this.roomManagerService.hasNoGameAvailable$.subscribe((hasNoGameAvailable) => {
            if (hasNoGameAvailable) this.dialog.open(NoGameAvailableDialogComponent, { disableClose: true });
        });
    }
}
