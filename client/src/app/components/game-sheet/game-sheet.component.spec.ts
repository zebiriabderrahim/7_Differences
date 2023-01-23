import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';

import { GameSheetComponent } from './game-sheet.component';

describe('GameSheetComponent', () => {
    let component: GameSheetComponent;
    let fixture: ComponentFixture<GameSheetComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameSheetComponent],
            providers: [{ provide: MatDialog, useValue: {} }],
        }).compileComponents();

        fixture = TestBed.createComponent(GameSheetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});