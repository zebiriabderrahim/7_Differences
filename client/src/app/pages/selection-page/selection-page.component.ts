// Id comes from database to allow _id
/* eslint-disable no-underscore-dangle */
import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { CarouselPaginator } from '@common/game-interfaces';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-selection-page',
    templateUrl: './selection-page.component.html',
    styleUrls: ['./selection-page.component.scss'],
})
export class SelectionPageComponent implements AfterViewInit, OnDestroy {
    gameCarrousel: CarouselPaginator;
    readonly homeRoute: string;
    readonly selectionRoute: string;
    readonly configRoute: string;
    private index: number;
    private reloadSubscription: Subscription;
    constructor(
        private readonly communicationService: CommunicationService,
        public router: Router,
        private readonly roomManagerService: RoomManagerService,
    ) {
        this.gameCarrousel = { hasNext: false, hasPrevious: false, gameCards: [] };
        this.homeRoute = '/home';
        this.selectionRoute = '/selection';
        this.configRoute = '/config';
        this.index = 0;
        this.roomManagerService.reconnect();
        this.roomManagerService.handleRoomEvents();
    }

    ngAfterViewInit(): void {
        this.loadGameCarrousel();
        this.handleGameCardsUpdate();
    }

    loadGameCarrousel() {
        this.communicationService.loadGameCarrousel(this.index).subscribe((gameCarrousel) => {
            if (gameCarrousel) {
                this.gameCarrousel = gameCarrousel;
            }
        });
    }

    nextCarrousel() {
        if (this.gameCarrousel.hasNext) {
            ++this.index;
            this.loadGameCarrousel();
        }
    }

    previousCarrousel() {
        if (this.gameCarrousel.hasPrevious) {
            --this.index;
            this.loadGameCarrousel();
        }
    }

    handleGameCardsUpdate() {
        this.reloadSubscription = this.roomManagerService.isReloadNeeded$.subscribe((isGameCardsNeedToBeReloaded) => {
            if (isGameCardsNeedToBeReloaded) {
                this.index = 0;
                this.loadGameCarrousel();
            }
        });
    }

    ngOnDestroy(): void {
        this.reloadSubscription?.unsubscribe();
    }
}
