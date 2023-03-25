import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { GameConfigConst } from '@common/game-interfaces';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-config-page',
    templateUrl: './config-page.component.html',
    styleUrls: ['./config-page.component.scss'],
})
export class ConfigPageComponent implements OnInit, OnDestroy {
    form = new FormControl('', [Validators.required]);
    readonly createRoute: string;
    readonly homeRoute: string;
    configConstants: GameConfigConst;
    private communicationSubscription: Subscription;

    constructor(private readonly communicationService: CommunicationService) {
        this.configConstants = { countdownTime: 0, penaltyTime: 5, bonusTime: 5 };
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

    getErrorMessage() {
        if (this.form.hasError('required')) {
            return 'Il manque une valeur requise pour la configuration';
        }
        return;
    }

    // onSubmit() {
    //     console.log('countdownTime:', this.configConstants.countdownTime);
    //     console.log('penaltyTime:', this.configConstants.penaltyTime);
    //     console.log('bonusTime:', this.configConstants.bonusTime);
    // }

    ngOnDestroy() {
        this.communicationSubscription.unsubscribe();
    }
}
