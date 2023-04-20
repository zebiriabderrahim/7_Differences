import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { COUNTDOWN_TIME, WAITING_TIME } from '@app/constants/constants';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { GameCardActions, PlayerData } from '@common/game-interfaces';
import { Subscription, filter, interval, takeWhile } from 'rxjs';

@Component({
    selector: 'app-waiting-player-to-join',
    templateUrl: './waiting-player-to-join.component.html',
    styleUrls: ['./waiting-player-to-join.component.scss'],
})
export class WaitingForPlayerToJoinComponent implements OnInit, OnDestroy {
    playerNames: string[];
    refusedMessage: string;
    countdown: number;
    actions: typeof GameCardActions;
    private playerNamesSubscription?: Subscription;
    private countdownSubscription: Subscription;
    private deletedGameIdSubscription: Subscription;

    // Services are needed for the dialog and dialog needs to talk to the parent component
    // eslint-disable-next-line max-params
    constructor(
        @Inject(MAT_DIALOG_DATA) private data: { roomId: string; player: string; gameId: string; isLimited: boolean },
        private readonly roomManagerService: RoomManagerService,
        private dialogRef: MatDialogRef<WaitingForPlayerToJoinComponent>,
        private readonly router: Router,
    ) {
        this.playerNames = [];
        this.actions = GameCardActions;
    }

    get isLimited(): boolean {
        return this.data.isLimited;
    }

    ngOnInit(): void {
        if (!this.data?.gameId) return;
        this.roomManagerService.getJoinedPlayerNames(this.data.gameId);
        this.loadPlayerNamesList();
        this.handleGameCardDelete();
    }

    refusePlayer(playerName: string) {
        const playerPayLoad = { gameId: this.data.gameId, playerName } as PlayerData;
        this.roomManagerService.refusePlayer(playerPayLoad);
    }

    acceptPlayer(playerName: string) {
        this.roomManagerService.acceptPlayer(this.data.gameId, this.data.roomId, playerName);
        this.router.navigate(['/game']);
    }

    undoCreateOneVsOneRoom() {
        if (this.data.player) this.roomManagerService.deleteCreatedOneVsOneRoom(this.data.roomId);
        else if (!this.data.player) this.roomManagerService.deleteCreatedCoopRoom(this.data.roomId);
    }

    ngOnDestroy(): void {
        this.playerNamesSubscription?.unsubscribe();
        this.countdownSubscription?.unsubscribe();
        this.deletedGameIdSubscription?.unsubscribe();
    }

    private loadPlayerNamesList(): void {
        this.playerNamesSubscription = this.roomManagerService.joinedPlayerNamesByGameId$
            .pipe(filter((playerNamesList) => !!playerNamesList))
            .subscribe((playerNamesList) => {
                this.playerNames = playerNamesList;
            });
    }

    private countDownBeforeClosing() {
        this.countdown = COUNTDOWN_TIME;
        const countdown$ = interval(WAITING_TIME).pipe(takeWhile(() => this.countdown > 0));
        const countdownObserver = {
            next: () => {
                this.countdown--;
                this.refusedMessage = `La fiche de jeu a été supprimée . Vous serez redirigé dans ${this.countdown} secondes`;
            },
            complete: () => {
                this.dialogRef.close();
            },
        };
        this.countdownSubscription = countdown$.subscribe(countdownObserver);
    }

    private handleGameCardDelete() {
        this.deletedGameIdSubscription = this.roomManagerService.deletedGameId$
            .pipe(filter((gameId) => gameId === this.data.gameId))
            .subscribe(() => {
                this.countDownBeforeClosing();
            });
    }
}
