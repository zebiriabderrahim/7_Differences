import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { CarouselPaginator } from '@common/game-interfaces';

@Component({
    selector: 'app-selection-page',
    templateUrl: './selection-page.component.html',
    styleUrls: ['./selection-page.component.scss'],
})
export class SelectionPageComponent implements AfterViewInit, OnDestroy {
    gameCarrousel: CarouselPaginator;
    readonly homeRoute: string = '/home';
    readonly selectionRoute: string = '/selection';
    readonly configRoute: string = '/config';
    private index: number = 0;
    constructor(
        private readonly communicationService: CommunicationService,
        public router: Router,
        private readonly roomManagerService: RoomManagerService,
    ) {
        this.gameCarrousel = { hasNext: false, hasPrevious: false, gameCards: [] };
        this.roomManagerService.handleRoomEvents();
    }

    ngAfterViewInit(): void {
        this.communicationService.loadGameCarrousel(this.index).subscribe((gameCarrousel) => {
            if (gameCarrousel) {
                this.gameCarrousel = gameCarrousel;
            }
        });
    }

    nextCarrousel() {
        if (this.gameCarrousel.hasNext) {
            this.communicationService.loadGameCarrousel(++this.index).subscribe((gameCarrousel) => {
                if (gameCarrousel) {
                    this.gameCarrousel = gameCarrousel;
                }
            });
        }
    }

    previousCarrousel() {
        if (this.gameCarrousel.hasPrevious) {
            this.communicationService.loadGameCarrousel(--this.index).subscribe((gameCarrousel) => {
                if (gameCarrousel) {
                    this.gameCarrousel = gameCarrousel;
                }
            });
        }
    }

    ngOnDestroy(): void {
        this.roomManagerService.disconnect();
    }
}
