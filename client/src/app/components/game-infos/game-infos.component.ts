import { Component, OnDestroy, OnInit } from '@angular/core';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { ClientSideGame } from '@common/game-interfaces';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-infos',
    templateUrl: './game-infos.component.html',
    styleUrls: ['./game-infos.component.scss'],
})
export class GameInfosComponent implements OnInit, OnDestroy {
    game: ClientSideGame;
    private readonly gameSubscription: Subscription;
    constructor(private readonly classicSystemService: ClassicSystemService) {}
    ngOnInit(): void {
        this.classicSystemService.currentGame.subscribe((game: ClientSideGame) => {
  
            this.game = game;
        });
    }
    ngOnDestroy(): void {
        this.gameSubscription.unsubscribe();
    }
}
