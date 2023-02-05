import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-config-page',
    templateUrl: './config-page.component.html',
    styleUrls: ['./config-page.component.scss'],
})
export class ConfigPageComponent implements OnInit, OnDestroy {
    readonly titre: string = 'Configure ton jeu';
    readonly createRoute: string = '/create';
    countdownTime: number;
    penaltyTime: number;
    bonusTime: number;

    private commSub: Subscription;

    constructor(private readonly communicationService: CommunicationService) {}

    ngOnInit() {
        this.commSub = this.communicationService.loadConfigConstants().subscribe((res) => {
            this.countdownTime = res.countdownTime;
            this.penaltyTime = res.penaltyTime;
            this.bonusTime = res.bonusTime;
        });
    }

    ngOnDestroy() {
        this.commSub.unsubscribe();
    }
}
