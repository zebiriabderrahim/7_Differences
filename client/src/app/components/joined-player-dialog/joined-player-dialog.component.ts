import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ONE_SECOND, TEN_SECONDS } from '@app/constants/constants';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { filter, interval, skip, Subscription, take, takeWhile } from 'rxjs';

@Component({
    selector: 'app-joined-player-dialog',
    templateUrl: './joined-player-dialog.component.html',
    styleUrls: ['./joined-player-dialog.component.scss'],
})
export class JoinedPlayerDialogComponent implements OnInit, OnDestroy {
    countdown: number;
    refusedMessage: string;
    private playerNamesSubscription: Subscription;
    private countdownSubscription: Subscription;
    private roomIdSubscription: Subscription;
    private acceptedPlayerSubscription: Subscription;

    // Services are needed for the dialog and dialog needs to talk to the parent component
    // eslint-disable-next-line max-params
    constructor(
        @Inject(MAT_DIALOG_DATA) private data: { gameId: string; player: string },
        private readonly roomManagerService: RoomManagerService,
        private dialogRef: MatDialogRef<JoinedPlayerDialogComponent>,
        private readonly router: Router,
    ) {}

    ngOnInit(): void {
        this.getJoinedPlayerNamesByGameId();
    }

    getJoinedPlayerNamesByGameId() {
        this.playerNamesSubscription = this.roomManagerService.joinedPlayerNamesByGameId$
            .pipe(
                skip(1),
                filter((data) => data.gameId === this.data.gameId && !!data.playerNamesList),
            )
            .subscribe((data) => {
                this.handleRefusedPlayer(data.playerNamesList);
                this.handleAcceptedPlayer();
            });
    }

    cancelJoining() {
        this.roomManagerService.cancelJoining(this.data.gameId, this.data.player);
    }
    handleRefusedPlayer(playerNames: string[]) {
        if (!playerNames.includes(this.data.player)) {
            this.countdown = TEN_SECONDS;
            const countdown$ = interval(ONE_SECOND).pipe(takeWhile(() => this.countdown > 0));
            const countdownObserver = {
                next: () => {
                    this.countdown--;
                    this.refusedMessage = `You have been refused. You will be redirected in ${this.countdown} seconds`;
                },
                complete: () => {
                    this.dialogRef.close();
                },
            };
            this.countdownSubscription = countdown$.subscribe(countdownObserver);
        }
    }

    handleAcceptedPlayer() {
        this.acceptedPlayerSubscription = this.roomManagerService.acceptedPlayerByRoom$
            .pipe(
                filter((data) => data?.playerName === this.data.player && data?.gameId === this.data.gameId),
                take(1),
            )
            .subscribe((data) => {
                this.dialogRef.close();
                this.router.navigate(['/game', data.roomId, data.playerName]);
            });
    }

    ngOnDestroy(): void {
        this.playerNamesSubscription?.unsubscribe();
        this.countdownSubscription?.unsubscribe();
        this.roomIdSubscription?.unsubscribe();
        this.acceptedPlayerSubscription?.unsubscribe();
    }
}
