import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CanvasTopButtonsComponent } from './canvas-top-buttons.component';

describe('CanvasTopButtonsComponent', () => {
    let component: CanvasTopButtonsComponent;
    let fixture: ComponentFixture<CanvasTopButtonsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MatButtonToggleModule,
                MatIconModule,
                MatFormFieldModule,
                MatSelectModule,
                FormsModule,
                HttpClientModule,
                ReactiveFormsModule,
                NoopAnimationsModule,
            ],
            declarations: [CanvasTopButtonsComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CanvasTopButtonsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
