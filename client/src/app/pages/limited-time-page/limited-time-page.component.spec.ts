import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LimitedTimePageComponent } from './limited-time-page.component';

describe('LimitedTimePageComponent', () => {
    let component: LimitedTimePageComponent;
    let fixture: ComponentFixture<LimitedTimePageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LimitedTimePageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(LimitedTimePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
