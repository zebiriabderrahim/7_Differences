import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameConfigConst } from '@common/game-interfaces';
import { CommunicationService } from '@app/services/communication-service/communication-service.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-config-page',
    templateUrl: './config-page.component.html',
    styleUrls: ['./config-page.component.scss'],
})
export class ConfigPageComponent implements OnInit, OnDestroy {
    readonly titre: string = 'Configure ton jeu';
    readonly createRoute: string = '/create';
    configConstants: GameConfigConst;

    private commSub: Subscription;

    constructor(private readonly communicationService: CommunicationService) {}

    ngOnInit() {
        this.commSub = this.communicationService.loadConfigConstants().subscribe((res) => {
            this.configConstants.countdownTime = res.countdownTime;
            this.configConstants.penaltyTime = res.penaltyTime;
            this.configConstants.bonusTime = res.bonusTime;
        });
    }

    ngOnDestroy() {
        this.commSub.unsubscribe();
    }
}
