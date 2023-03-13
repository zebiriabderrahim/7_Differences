import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIcon } from '@angular/material/icon';
import { CanvasMiddleButtonsComponent } from './canvas-middle-buttons.component';

describe('CanvasMiddleButtonsComponent', () => {
    let component: CanvasMiddleButtonsComponent;
    let fixture: ComponentFixture<CanvasMiddleButtonsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CanvasMiddleButtonsComponent, MatIcon],
        }).compileComponents();

        fixture = TestBed.createComponent(CanvasMiddleButtonsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
