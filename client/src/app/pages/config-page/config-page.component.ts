import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameConfig } from '@app/interfaces/game-interfaces';
import { CommunicationService } from '@app/services/communication-service/communication-service.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-config-page',
    templateUrl: './config-page.component.html',
    styleUrls: ['./config-page.component.scss'],
})
export class ConfigPageComponent implements OnInit, OnDestroy {
    readonly titre: string = 'Configure ton jeu';
    readonly imageSrc: string = '../../../assets/img/rat.jpg';
    readonly newImageSrc: string = '../../../assets/img/strong_rat.jpg';
    // eslint-disable-next-line no-alert, quotes, semi, @typescript-eslint/no-magic-numbers
    readonly gamePhase: number = 4;
    readonly createRoute: string = '/create';
    readonly constants: GameConfig;

    private commSub: Subscription;

    constructor(private readonly communicationService: CommunicationService) {}

    ngOnInit() {
        this.commSub = this.communicationService.loadConfigConstants().subscribe((res) => {
            this.constants.countdownTime = res.countdownTime;
            this.constants.penaltyTime = res.penaltyTime;
            this.constants.bonusTime = res.bonusTime;
        });
    }

    ngOnDestroy() {
        this.commSub.unsubscribe();
    }
}
