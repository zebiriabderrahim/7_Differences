import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunicationService } from '@app/services/communication-service/communication-service.service';

import { SelectionPageComponent } from './selection-page.component';

describe('SelectionPageComponent', () => {
    let component: SelectionPageComponent;
    let fixture: ComponentFixture<SelectionPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SelectionPageComponent],
            providers: [CommunicationService, HttpClient, HttpHandler],
        }).compileComponents();

        fixture = TestBed.createComponent(SelectionPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // it('#nextFour() should display the next 4 games', () => {
    //     const currentPhase = component.gameIterator;
    //     expect(component.gameIterator).toEqual(currentPhase);
    //     component.nextFour();
    //     expect(component.gameIterator).toEqual(currentPhase + component.gamePhase);
    // });

    it('#lastFour() should display the last 4 games', () => {
        component.gameIterator += component.gamePhase;
        const currentPhase = component.gameIterator;
        expect(component.gameIterator).toEqual(currentPhase);
        component.lastFour();
        expect(component.gameIterator).toEqual(currentPhase - component.gamePhase);
    });
});
