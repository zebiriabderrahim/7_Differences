import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { filter, interval, skip, Subscription, takeWhile } from 'rxjs';

@Component({
    selector: 'app-joined-player-dialog',
    templateUrl: './joined-player-dialog.component.html',
    styleUrls: ['./joined-player-dialog.component.scss'],
})
export class JoinedPlayerDialogComponent implements OnInit, OnDestroy {
    countdown: number;
    refusedMessage: string;
    private gameId: string;
    private playerNamesSubscription: Subscription;
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { gameId: string; player: string },
        private readonly classicSystemService: ClassicSystemService,
        public dialogRef: MatDialogRef<JoinedPlayerDialogComponent>,
        private readonly router: Router,
    ) {
        this.classicSystemService.manageSocket();
    }

    ngOnInit(): void {
        this.gameId = this.data.gameId;
        this.getJoinedPlayerNamesByGameId();
    }

    getJoinedPlayerNamesByGameId() {
        this.playerNamesSubscription = this.classicSystemService.joinedPlayerNamesByGameId$
            .pipe(
                skip(1),
                filter((data) => data.gameId === this.gameId && !!data.playerNamesList),
            )
            .subscribe((data) => {
                this.handleRefusedPlayer(data.playerNamesList);
                this.handleAcceptedPlayer(data.playerNamesList);
            });
    }

    cancelJoining() {
        this.classicSystemService.cancelJoining(this.gameId, this.data.player);
    }
    handleRefusedPlayer(playerNames: string[]) {
        if (!playerNames.includes(this.data.player)) {
            this.countdown = 10;
            const countdown$ = interval(1000).pipe(takeWhile(() => this.countdown > 0));
            const countdownObserver = {
                next: () => {
                    this.countdown--;
                    this.refusedMessage = `You have been refused. You will be redirected in ${this.countdown} seconds`;
                },
                complete: () => {
                    this.dialogRef.close();
                },
            };
            countdown$.subscribe(countdownObserver);
        }
    }

    handleAcceptedPlayer(playerNames: string[]) {
        if (playerNames.includes(this.data.player)) {
            this.dialogRef.close();
            this.router.navigate(['/game']);
        }
    }

    ngOnDestroy(): void {
        if (this.playerNamesSubscription) {
            this.playerNamesSubscription.unsubscribe();
        }
        this.classicSystemService.disconnect();
    }
}
