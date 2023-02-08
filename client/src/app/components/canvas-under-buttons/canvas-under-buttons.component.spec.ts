import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasUnderButtonsComponent } from './canvas-under-buttons.component';

describe('CanvasUnderButtonsComponent', () => {
    let component: CanvasUnderButtonsComponent;
    let fixture: ComponentFixture<CanvasUnderButtonsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CanvasUnderButtonsComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CanvasUnderButtonsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
