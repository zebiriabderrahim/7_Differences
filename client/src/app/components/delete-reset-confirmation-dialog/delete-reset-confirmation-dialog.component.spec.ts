import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteResetConfirmationDialogComponent } from './delete-reset-confirmation-dialog.component';

describe('DeleteResetConfirmationDialogComponent', () => {
    let component: DeleteResetConfirmationDialogComponent;
    let fixture: ComponentFixture<DeleteResetConfirmationDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DeleteResetConfirmationDialogComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(DeleteResetConfirmationDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
