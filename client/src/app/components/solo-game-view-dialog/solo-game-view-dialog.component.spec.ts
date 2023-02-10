import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SoloGameViewDialogComponent } from './solo-game-view-dialog.component';

describe('SoloGameViewDialogComponent', () => {
    let component: SoloGameViewDialogComponent;
    let fixture: ComponentFixture<SoloGameViewDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SoloGameViewDialogComponent],
            imports: [MAT_DIALOG_DATA, MatDialogModule],
            providers: [
                {
                    provide: MatDialog,
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(SoloGameViewDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
