import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ONE_SECOND, TEN_SECONDS } from '@app/constants/constants';
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
    private deletedGameIdSubscription: Subscription;

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
        // this.roomManagerService.joinedPlayerNames(this.data.gameId);
        this.loadPlayerNamesList();
        this.handleGameCardDelete();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toArray(obj: any): any[] {
        return Object.values(obj);
    }

    loadPlayerNamesList(): void {
        this.playerNamesSubscription = this.roomManagerService.joinedPlayerNamesByGameId$
            .pipe(filter((playerNamesList) => !!playerNamesList))
            .subscribe((playerNamesList) => {
                this.playerNames = playerNamesList;
            });
    }

    refusePlayer(playerName: string) {
        this.roomManagerService.refusePlayer(this.data.gameId, playerName);
    }

    acceptPlayer(playerName: string) {
        this.roomManagerService.acceptPlayer(this.data.gameId, this.data.roomId, playerName);
        this.router.navigate(['/game']);
    }

    undoCreateOneVsOneRoom() {
        this.roomManagerService.deleteCreatedOneVsOneRoom(this.data.roomId);
    }

    countDownBeforeClosing() {
        this.countdown = TEN_SECONDS;
        const countdown$ = interval(ONE_SECOND).pipe(takeWhile(() => this.countdown > 0));
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

    handleGameCardDelete() {
        this.deletedGameIdSubscription = this.roomManagerService.deletedGameId$
            .pipe(filter((gameId) => gameId === this.data.gameId))
            .subscribe(() => {
                this.countDownBeforeClosing();
            });
    }

    ngOnDestroy(): void {
        this.playerNamesSubscription?.unsubscribe();
        this.countdownSubscription?.unsubscribe();
        this.deletedGameIdSubscription?.unsubscribe();
    }
}
