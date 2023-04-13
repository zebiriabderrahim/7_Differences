import { Component, OnInit } from '@angular/core';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { GameHistory } from '@common/game-interfaces';

@Component({
    selector: 'app-history-box',
    templateUrl: './history-box.component.html',
    styleUrls: ['./history-box.component.scss'],
})
export class HistoryBoxComponent implements OnInit {
    gameHistory: GameHistory[];
    constructor(private readonly roomManager: RoomManagerService, private readonly communicationService: CommunicationService) {
        this.gameHistory = [];
    }

    ngOnInit(): void {
        this.loadHistory();
        this.handHistoryUpdate();
    }

    loadHistory(): void {
        this.communicationService.loadGameHistory().subscribe((history: GameHistory[]) => {
            this.gameHistory = history;
        });
    }

    handHistoryUpdate(): void {
        this.roomManager.isGameHistoryReloadNeeded$.subscribe((isGameHistoryReloadNeeded: boolean) => {
            if (isGameHistoryReloadNeeded) this.loadHistory();
        });
    }

    deleteAllGamesHistory(): void {
        this.communicationService.deleteAllGamesHistory().subscribe(() => {
            this.gameHistory = [];
            this.roomManager.gamesHistoryDeleted();
        });
    }
}
