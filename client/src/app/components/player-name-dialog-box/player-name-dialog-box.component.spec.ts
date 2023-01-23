import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerNameDialogBoxComponent } from './player-name-dialog-box.component';

describe('PlayerNameDialogBoxComponent', () => {
    let component: PlayerNameDialogBoxComponent;
    let fixture: ComponentFixture<PlayerNameDialogBoxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PlayerNameDialogBoxComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayerNameDialogBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
