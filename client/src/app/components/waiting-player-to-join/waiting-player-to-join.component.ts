import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TEN_SECONDS, ONE_SECOND } from '@app/constants/constants';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { GameCardActions } from '@common/game-interfaces';
import { filter, interval, Subscription, takeWhile } from 'rxjs';

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

    // Services are needed for the dialog and dialog needs to talk to the parent component
    // eslint-disable-next-line max-params
    constructor(
        @Inject(MAT_DIALOG_DATA) private data: { roomId: string; player: string; gameId: string },
        private readonly roomManagerService: RoomManagerService,
        private dialogRef: MatDialogRef<WaitingForPlayerToJoinComponent>,
        private readonly router: Router,
    ) {
        this.playerNames = [];
        this.actions = GameCardActions;
    }
    ngOnInit(): void {
        this.getJoinedPlayerNamesByGameId();
        this.roomManagerService.deletedGameId$.pipe(filter((gameId) => gameId === this.data.gameId)).subscribe(() => {
            console.log('deleted game id');
            this.countDownBeforeClosing();
        });
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
            this.router.navigate(['/game', this.data.roomId, this.data.player]);
        });
    }

    undoCreateOneVsOneRoom() {
        this.roomManagerService.deleteCreatedOneVsOneRoom(this.data.gameId);
        this.playerNames.forEach((player) => {
            this.refusePlayer(player);
        });
    }

    countDownBeforeClosing() {
        this.countdown = TEN_SECONDS;
        const countdown$ = interval(ONE_SECOND).pipe(takeWhile(() => this.countdown > 0));
        const countdownObserver = {
            next: () => {
                this.countdown--;
                this.refusedMessage = `La fiche de jeu a été supprimée. Vous serez redirigé dans ${this.countdown} secondes`;
            },
            complete: () => {
                this.dialogRef.close();
            },
        };
        this.countdownSubscription = countdown$.subscribe(countdownObserver);
    }

    ngOnDestroy(): void {
        this.playerNamesSubscription?.unsubscribe();
        this.countdownSubscription?.unsubscribe();
    }
}
