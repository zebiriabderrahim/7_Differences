import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PlayerNameDialogBoxComponent } from '@app/components/player-name-dialog-box/player-name-dialog-box.component';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { filter, Subscription } from 'rxjs';

@Component({
    selector: 'app-limited-time-page',
    templateUrl: './limited-time-page.component.html',
    styleUrls: ['./limited-time-page.component.scss'],
})
export class LimitedTimePageComponent implements OnDestroy {
    roomIdSubscription: Subscription;
    private playerName: string;
    constructor(public router: Router, private readonly roomManagerService: RoomManagerService, private readonly dialog: MatDialog) {
        this.roomManagerService.handleRoomEvents();
        this.openDialog();
    }

    openDialog() {
        this.dialog
            .open(PlayerNameDialogBoxComponent, { disableClose: true })
            .afterClosed()
            .subscribe((playerName) => {
                if (playerName) {
                    this.playerName = playerName;
                } else {
                    this.router.navigate(['/']);
                }
            });
    }

    playLimitedSolo() {
        this.roomManagerService.createSoloLimitedRoom(this.playerName);
        this.redirectToGamePage();
    }

    redirectToGamePage() {
        this.roomIdSubscription = this.roomManagerService.createdRoomId$.pipe(filter((roomId) => !!roomId)).subscribe(() => {
            this.router.navigate(['/game']);
        });
    }

    ngOnDestroy(): void {
        this.roomIdSubscription?.unsubscribe();
    }
}
