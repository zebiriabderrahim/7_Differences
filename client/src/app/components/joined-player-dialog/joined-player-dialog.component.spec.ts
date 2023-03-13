import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinedPlayerDialogComponent } from './joined-player-dialog.component';

describe('JoinedPlayerDialogComponent', () => {
    let component: JoinedPlayerDialogComponent;
    let fixture: ComponentFixture<JoinedPlayerDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JoinedPlayerDialogComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(JoinedPlayerDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
