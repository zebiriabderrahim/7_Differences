import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CarouselPaginator } from '@app/interfaces/game-interfaces';
import { CommunicationService } from '@app/services/communication-service/communication.service';

@Component({
    selector: 'app-selection-page',
    templateUrl: './selection-page.component.html',
    styleUrls: ['./selection-page.component.scss'],
})
export class SelectionPageComponent implements OnInit {
    titre: string;
    gameCarrousel: CarouselPaginator;
    index: number = 0;
    constructor(private communicationService: CommunicationService, public router: Router) {
        this.gameCarrousel = { hasNext: false, hasPrevious: false, gameCards: [] };
    }

    navigate() {
        if (this.router.url === '/selection') {
            this.titre = 'Selectionne ton jeu';
        } else if (this.router.url === '/config') {
            this.titre = 'Configure ton jeu';
        }
    }

    ngOnInit(): void {
        this.communicationService.loadGameCarrousel(this.index).subscribe((gameCarrousel) => {
            if (gameCarrousel) {
                this.gameCarrousel = gameCarrousel;
            }
        });
    }

    hasNext() {
        if (this.gameCarrousel.hasNext) {
            this.communicationService.loadGameCarrousel(++this.index).subscribe((gameCarrousel) => {
                if (gameCarrousel) {
                    this.gameCarrousel = gameCarrousel;
                }
            });
        }
    }

    hasPrevious() {
        if (this.gameCarrousel.hasPrevious) {
            this.communicationService.loadGameCarrousel(--this.index).subscribe((gameCarrousel) => {
                if (gameCarrousel) {
                    this.gameCarrousel = gameCarrousel;
                }
            });
        }
    }
}
