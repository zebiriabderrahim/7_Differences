import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { GameConfigConst } from '@common/game-interfaces';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-config-page',
    templateUrl: './config-page.component.html',
    styleUrls: ['./config-page.component.scss'],
})
export class ConfigPageComponent implements OnInit, OnDestroy {
    configForm: FormGroup;
    readonly createRoute: string;
    readonly homeRoute: string;
    configConstants: GameConfigConst;
    private communicationSubscription: Subscription;

    constructor(private readonly communicationService: CommunicationService, private formBuilder: FormBuilder) {
        this.configConstants = { countdownTime: 0, penaltyTime: 5, bonusTime: 5 };
        this.homeRoute = '/home';
        this.createRoute = '/create';
        this.configForm = this.formBuilder.group({
            countdownTime: ['', Validators.required],
            penaltyTime: ['', Validators.required],
            bonusTime: ['', Validators.required],
        });
    }

    ngOnInit() {
        this.communicationSubscription = this.communicationService.loadConfigConstants().subscribe((res) => {
            this.configConstants.countdownTime = res.countdownTime;
            this.configConstants.penaltyTime = res.penaltyTime;
            this.configConstants.bonusTime = res.bonusTime;
        });
    }

    onSubmit() {
        this.configConstants.countdownTime = this.configForm.controls['countdownTime'].value;
        this.configConstants.penaltyTime = this.configForm.controls['penaltyTime'].value;
        this.configConstants.bonusTime = this.configForm.controls['bonusTime'].value;
        this.configForm.reset();
    }

    ngOnDestroy() {
        this.communicationSubscription.unsubscribe();
    }
}
