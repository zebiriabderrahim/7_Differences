import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '@app/modules/app-routing.module';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { of } from 'rxjs';

import { SelectionPageComponent } from './selection-page.component';

describe('SelectionPageComponent', () => {
    let component: SelectionPageComponent;
    let fixture: ComponentFixture<SelectionPageComponent>;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes(routes), MatGridListModule, FormsModule],
            declarations: [SelectionPageComponent],
            providers: [
                HttpClient,
                HttpHandler,
                {
                    provide: CommunicationService,
                    useValue: jasmine.createSpyObj('CommunicationService', {
                        loadGameCarrousel: of({ hasNext: false, hasPrevious: false, gameCards: [] }),
                    }),
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(SelectionPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        router = TestBed.inject(Router);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Page titre should be Selectionne ton jeu if the page is /selection', () => {
        router.navigate(['selection']);
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            component.navigate();
            expect(component.titre).toEqual('Selectionne ton jeu');
        });
    });

    it('Page titre should be Configure ton jeu if the page is /selection', () => {
        router.navigate(['config']);
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            component.navigate();
            expect(component.titre).toEqual('Configure ton jeu');
        });
    });

    it('should load a Carrousel when this one exist', () => {
        component.ngOnInit();
        expect(component.gameCarrousel).toEqual({ hasNext: false, hasPrevious: false, gameCards: [] });
    });

    it('should load the next Carrousel when clicking on the next_button', () => {
        component.gameCarrousel.hasNext = true;
        component.hasNext();
        expect(component.gameCarrousel).toEqual({ hasNext: true, hasPrevious: false, gameCards: [] });
    });

    it('should load the previous Carrousel when clicking on the previous_button', () => {
        component.gameCarrousel.hasPrevious = true;
        component.hasPrevious();
        expect(component.gameCarrousel).toEqual({ hasNext: false, hasPrevious: true, gameCards: [] });
    });
});
