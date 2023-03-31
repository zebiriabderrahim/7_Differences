import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DeleteResetConfirmationDialogComponent } from './delete-reset-confirmation-dialog.component';

describe('DeleteResetConfirmationDialogComponent', () => {
    let component: DeleteResetConfirmationDialogComponent;
    let fixture: ComponentFixture<DeleteResetConfirmationDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DeleteResetConfirmationDialogComponent],
            imports: [MatDialogModule, HttpClientModule],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(DeleteResetConfirmationDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});