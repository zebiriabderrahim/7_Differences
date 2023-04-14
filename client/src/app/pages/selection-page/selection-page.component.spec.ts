/* eslint-disable no-underscore-dangle */
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { NavBarComponent } from '@app/components/nav-bar/nav-bar.component';
import { routes } from '@app/modules/app-routing.module';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { BehaviorSubject, Subscription, Subscription, of } from 'rxjs';
import { SelectionPageComponent } from './selection-page.component';

describe('SelectionPageComponent', () => {
    let component: SelectionPageComponent;
    let fixture: ComponentFixture<SelectionPageComponent>;
    let roomManagerService: jasmine.SpyObj<RoomManagerService>;
    let deletedGameIdMock: BehaviorSubject<string>;

    beforeEach(async () => {
        deletedGameIdMock = new BehaviorSubject<string>('idMock');
        roomManagerService = jasmine.createSpyObj('RoomManagerService', ['handleRoomEvents', 'connect', 'disconnect', 'removeAllListeners'], {
            deletedGameId$: deletedGameIdMock,
            isReloadNeeded$: of(true),
        });
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes(routes), MatGridListModule, FormsModule, MatIconModule],
            declarations: [SelectionPageComponent, NavBarComponent],
            providers: [
                HttpClient,
                HttpHandler,
                {
                    provide: CommunicationService,
                    useValue: jasmine.createSpyObj('CommunicationService', {
                        loadGameCarrousel: of({ hasNext: false, hasPrevious: false, gameCards: [] }),
                    }),
                },
                { provide: RoomManagerService, useValue: roomManagerService },
            ],
            teardown: { destroyAfterEach: false },
        }).compileComponents();

        fixture = TestBed.createComponent(SelectionPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed to callFake
        spyOn(component, 'ngOnDestroy').and.callFake(() => {});
        fixture.destroy();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load a Carrousel when this one exist', () => {
        component.ngAfterViewInit();
        expect(component.gameCarrousel).toEqual({ hasNext: false, hasPrevious: false, gameCards: [] });
    });

    it('should load the next Carrousel and increase component index when clicking on the next_button', () => {
        component['index'] = 0;
        component.gameCarrousel.hasNext = true;
        component.nextCarrousel();
        expect(component.gameCarrousel).toEqual({ hasNext: true, hasPrevious: false, gameCards: [] });
        expect(component['index']).toEqual(1);
    });

    it('should load the previous Carrousel and decrement component index when clicking on the previous_button', () => {
        component['index'] = 1;
        component.gameCarrousel.hasPrevious = true;
        component.previousCarrousel();
        expect(component.gameCarrousel).toEqual({ hasNext: false, hasPrevious: true, gameCards: [] });
        expect(component['index']).toEqual(0);
    });

    it('should reload game carousel if reload is needed', () => {
        spyOn(component, 'loadGameCarrousel');
        component.handleGameCardsUpdate();
        fixture.detectChanges();
        expect(component['index']).toBe(0);
        expect(component.loadGameCarrousel).toHaveBeenCalled();
    });

    it('should unsubscribe reloadSubscription when component is destroyed', () => {
        component['reloadSubscription'] = undefined as unknown as Subscription;
        component.ngOnDestroy();
        expect(component['reloadSubscription']).toBeUndefined();
    });

    it('should unsubscribe reloadSubscription when component is destroyed', () => {
        component['reloadSubscription'] = undefined as unknown as Subscription;
        component.ngOnDestroy();
        expect(component['reloadSubscription']).toBeUndefined();
    });
});
