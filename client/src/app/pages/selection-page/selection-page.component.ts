import { Component, OnInit } from '@angular/core';
import { GameCard } from '@app/interfaces/game-interfaces';
import { CommunicationService } from '@app/services/communication-service/communication-service.service';

@Component({
    selector: 'app-selection-page',
    templateUrl: './selection-page.component.html',
    styleUrls: ['./selection-page.component.scss'],
})
export class SelectionPageComponent implements OnInit {
    titre: string = 'Selectionne ton jeu';
    imageSrc: string = '../../../assets/img/rat.jpg';
    newImageSrc: string = '../../../assets/img/strong_rat.jpg';
    // eslint-disable-next-line no-alert, quotes, semi, @typescript-eslint/no-magic-numbers
    gamePhase: number = 4;
    games: GameCard[];
    hasPrevious: boolean = false;
    hasNext: boolean = true;
    gameIterator: number = 0;
    constructor(private communicationService: CommunicationService) {}

    ngOnInit(): void {
        this.communicationService.loadAllGames().subscribe((games) => {
            this.games = games;
        });
    }

    lastFour() {
        this.gameIterator -= this.gamePhase;
        this.hasNext = true;
        this.hasPrevious = true;
        if (this.gameIterator <= 0) {
            this.hasPrevious = false;
        }
    }

    nextFour() {
        this.gameIterator += this.gamePhase;
        this.hasNext = true;
        this.hasPrevious = true;
        if (this.gameIterator >= this.games.length - this.gamePhase) {
            this.hasNext = false;
        }
    }

    selectedGamecard() {
        alert('Va à la page du jeu selectionné');
    }
}
