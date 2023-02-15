import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '@app/modules/app-routing.module';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { of } from 'rxjs';

import { SelectionPageComponent } from './selection-page.component';

describe('SelectionPageComponent', () => {
    let component: SelectionPageComponent;
    let fixture: ComponentFixture<SelectionPageComponent>;

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
        component.hasNext();
        expect(component.gameCarrousel).toEqual({ hasNext: true, hasPrevious: false, gameCards: [] });
        expect(component['index']).toEqual(1);
    });

    it('should load the previous Carrousel and decrement component index when clicking on the previous_button', () => {
        component['index'] = 1;
        component.gameCarrousel.hasPrevious = true;
        component.hasPrevious();
        expect(component.gameCarrousel).toEqual({ hasNext: false, hasPrevious: true, gameCards: [] });
        expect(component['index']).toEqual(0);
    });
});
