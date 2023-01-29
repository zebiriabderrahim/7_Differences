import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ImageValidationDialogComponent } from './image-validation-dialog.component';

describe('ImageValidationDialogComponent', () => {
    let component: ImageValidationDialogComponent;
    let fixture: ComponentFixture<ImageValidationDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ImageValidationDialogComponent],
            imports: [MatFormFieldModule, MatDialogModule],
            providers: [
                {
                    provide: MatDialog,
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ImageValidationDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
