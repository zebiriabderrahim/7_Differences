import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { CarrouselPaginator } from '@app/interfaces/game-interfaces';
import { CommunicationService } from '@app/services/communication-service/communication-service.service';

@Component({
    selector: 'app-selection-page',
    templateUrl: './selection-page.component.html',
    styleUrls: ['./selection-page.component.scss'],
})
export class SelectionPageComponent implements AfterViewInit {
    titre: string;
    gameCarrousel: CarrouselPaginator;
    index: number = 0;
    constructor(private communicationService: CommunicationService, public router: Router) {
        this.gameCarrousel = { hasNext: false, hasPrevious: false, gameCards: [] };
    }

    ngAfterViewInit(): void {
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
