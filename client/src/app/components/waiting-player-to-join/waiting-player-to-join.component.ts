import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';

@Component({
    selector: 'app-waiting-player-to-join',
    templateUrl: './waiting-player-to-join.component.html',
    styleUrls: ['./waiting-player-to-join.component.scss'],
})
export class WaitingForPlayerToJoinComponent implements OnInit {
    playerNames: string[];
    private gameId: string;
    constructor(@Inject(MAT_DIALOG_DATA) public data: { gameId: string }, private readonly classicSystemService: ClassicSystemService) {
        this.classicSystemService.manageSocket();
    }
    ngOnInit(): void {
        this.gameId = this.data.gameId;
        this.classicSystemService.joinedPlayerNamesByGameId$.subscribe((playerNames) => {
            if (playerNames.has(this.gameId)) {
                this.playerNames = playerNames.get(this.gameId) ?? [];
            }
        });
    }

    refusePlayer(nameIndex: number) {
        this.playerNames.filter((name, index) => index !== nameIndex);
        this.classicSystemService.refusePlayer(this.gameId, this.playerNames);
    }

    acceptPlayer(index: number) {
        this.playerNames[index]
        console.log('accept player');
    }
}
