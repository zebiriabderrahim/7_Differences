import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';

import { GameSheetConfigComponent } from './game-sheet-config.component';

describe('GameSheetConfigComponent', () => {
    let component: GameSheetConfigComponent;
    let fixture: ComponentFixture<GameSheetConfigComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameSheetConfigComponent],
            providers: [{ provide: MatDialog, useValue: {} }],
        }).compileComponents();

        fixture = TestBed.createComponent(GameSheetConfigComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
