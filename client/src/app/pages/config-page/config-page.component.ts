import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { GameConfigConst } from '@common/game-interfaces';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-config-page',
    templateUrl: './config-page.component.html',
    styleUrls: ['./config-page.component.scss'],
})
export class ConfigPageComponent implements OnInit, OnDestroy {
    readonly createRoute: string;
    readonly homeRoute: string;
    configConstants: GameConfigConst;
    private communicationSubscription: Subscription;

    constructor(private readonly communicationService: CommunicationService) {
        this.configConstants = { countdownTime: 0, penaltyTime: 0, bonusTime: 0 };
        this.homeRoute = '/home';
        this.createRoute = '/create';
    }

    ngOnInit() {
        this.communicationSubscription = this.communicationService.loadConfigConstants().subscribe((res) => {
            this.configConstants.countdownTime = res.countdownTime;
            this.configConstants.penaltyTime = res.penaltyTime;
            this.configConstants.bonusTime = res.bonusTime;
        });
    }

    ngOnDestroy() {
        this.communicationSubscription.unsubscribe();
    }
}
