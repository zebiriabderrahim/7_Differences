import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ConfigDialogComponent } from './config-dialog.component';

describe('ConfigDialogComponent', () => {
    let component: ConfigDialogComponent;
    let fixture: ComponentFixture<ConfigDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConfigDialogComponent],
            imports: [MatDialogModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, HttpClientModule, NoopAnimationsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(ConfigDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
