import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameCard } from '@app/interfaces/game-interfaces';
import { CommunicationService } from '@app/services/communication-service/communication-service.service';

@Component({
    selector: 'app-selection-page',
    templateUrl: './selection-page.component.html',
    styleUrls: ['./selection-page.component.scss'],
})
export class SelectionPageComponent implements OnInit {
    titre: string;
    imageSrc: string = '../../../assets/img/rat.jpg';
    newImageSrc: string = '../../../assets/img/strong_rat.jpg';
    // eslint-disable-next-line no-alert, quotes, semi, @typescript-eslint/no-magic-numbers
    gamePhase: number = 4;
    games: GameCard[];
    hasPrevious: boolean = false;
    hasNext: boolean = false;
    gameIterator: number = 0;
    gameCarrousel: GameCard[];
    constructor(private communicationService: CommunicationService, public router: Router) {}

    navigate() {
        if (this.router.url === '/selection') {
            this.titre = 'Selectionne ton jeu';
        } else if (this.router.url === '/config') {
            this.titre = 'Configure ton jeu';
        }
    }

    ngOnInit(): void {
        this.communicationService.loadAllGames().subscribe((games) => {
            this.games = games;
            this.phaseVerification();
        });
    }

    phaseVerification() {
        this.hasNext = this.games.length - (this.gameIterator + this.gamePhase) > 0 ? true : false;
        this.hasPrevious = this.gameIterator !== 0 ? true : false;
        this.gameCarrousel = this.games.slice(this.gameIterator, this.gameIterator + this.gamePhase);
    }

    nextFour() {
        this.gameIterator += this.gamePhase;
        this.phaseVerification();
    }
    lastFour() {
        this.gameIterator -= this.gamePhase;
        this.phaseVerification();
    }
}
