import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigPageComponent } from './config-page.component';

describe('ConfigPageComponent', () => {
    let component: ConfigPageComponent;
    let fixture: ComponentFixture<ConfigPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConfigPageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ConfigPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#nextFour() should display the next 4 games', () => {
        const currentPhase = component.gameIterator;
        expect(component.gameIterator).toEqual(currentPhase);
        component.nextFour();
        expect(component.gameIterator).toEqual(currentPhase + component.gamePhase);
    });

    it('#lastFour() should display the last 4 games', () => {
        component.gameIterator += component.gamePhase;
        const currentPhase = component.gameIterator;
        expect(component.gameIterator).toEqual(currentPhase);
        component.lastFour();
        expect(component.gameIterator).toEqual(currentPhase - component.gamePhase);
    });
});
