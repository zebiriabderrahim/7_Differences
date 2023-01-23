import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChronometerComponent } from './chronometer.component';

describe('ChronometerComponent', () => {
    let component: ChronometerComponent;
    let fixture: ComponentFixture<ChronometerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChronometerComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ChronometerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
