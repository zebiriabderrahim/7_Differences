import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoloGameViewDialogComponent } from './solo-game-view-dialog.component';

describe('SoloGameViewDialogComponent', () => {
    let component: SoloGameViewDialogComponent;
    let fixture: ComponentFixture<SoloGameViewDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SoloGameViewDialogComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(SoloGameViewDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
