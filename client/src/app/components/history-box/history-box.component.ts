import { Component } from '@angular/core';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { GameHistory } from '@common/game-interfaces';
// import { GameHistory } from '@common/game-interfaces';

@Component({
    selector: 'app-history-box',
    templateUrl: './history-box.component.html',
    styleUrls: ['./history-box.component.scss'],
})
export class HistoryBoxComponent {
    constructor(private readonly roomManager: RoomManagerService) {}

    get gameHistory(): GameHistory[] {
        console.log('history box');
        console.log(this.roomManager.gameHistory);
        return this.roomManager.gameHistory;
    }
}
