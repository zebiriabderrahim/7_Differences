import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
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
    private gameId: string;
    private playerNamesSubscription: Subscription;
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { gameId: string; player: string; action: GameCardActions },
        private readonly classicSystemService: ClassicSystemService,
        public dialogRef: MatDialogRef<WaitingForPlayerToJoinComponent>,
        private readonly router: Router,
    ) {
        this.classicSystemService.manageSocket();
    }
    ngOnInit(): void {
        this.gameId = this.data.gameId;
        this.getJoinedPlayerNamesByGameId();
    }

    getJoinedPlayerNamesByGameId(): void {
        this.playerNamesSubscription = this.classicSystemService.joinedPlayerNamesByGameId$
            .pipe(filter((data) => data.gameId === this.gameId && !!data.playerNamesList))
            .subscribe((data) => {
                this.playerNames = data.playerNamesList;
            });
    }

    refusePlayer(playerName: string) {
        this.classicSystemService.refusePlayer(this.gameId, playerName);
    }

    acceptPlayer(playerName: string) {
        this.playerNames.forEach((player) => {
            if (player !== playerName) {
                this.refusePlayer(player);
            }
        });
        this.classicSystemService.acceptPlayer(this.gameId, playerName);
        this.dialogRef.close();
        this.router.navigate(['/game']);
    }

    undoCreateOneVsOne() {
        this.classicSystemService.deleteCreatedOneVsOneRoom(this.data.gameId);
    }

    ngOnDestroy(): void {
        if (this.playerNamesSubscription) {
            this.playerNamesSubscription.unsubscribe();
        }
        this.classicSystemService.disconnect();
    }
}
