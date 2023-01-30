import { Component, OnInit } from '@angular/core';
import { GameCard } from '@app/interfaces/game-interfaces';
import { CommunicationService } from '@app/services/communication-service/communication-service.service';

@Component({
    selector: 'app-config-page',
    templateUrl: './config-page.component.html',
    styleUrls: ['./config-page.component.scss'],
})
export class ConfigPageComponent implements OnInit {
    readonly titre: string = 'Configure ton jeu';
    readonly imageSrc: string = '../../../assets/img/rat.jpg';
    readonly newImageSrc: string = '../../../assets/img/strong_rat.jpg';
    // eslint-disable-next-line no-alert, quotes, semi, @typescript-eslint/no-magic-numbers
    readonly gamePhase: number = 4;

    readonly createRoute: string = '/create';

    readonly timeCountdown: string = '30 secondes';
    readonly timePenalty: string = '5 secondes';
    readonly timeWonByDifference: string = '5 secondes';

    games: GameCard[];

    hasPrevious: boolean = false;
    hasNext: boolean = true;
    gameIterator: number = 0;

    constructor(private readonly communicationService: CommunicationService) {}

    ngOnInit(): void {
        this.communicationService.loadAllGames().subscribe((games) => {
            this.games = games;
        });
    }
}
