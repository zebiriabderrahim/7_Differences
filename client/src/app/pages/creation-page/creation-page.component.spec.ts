import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { ImageCanvasComponent } from '@app/components/image-canvas/image-canvas.component';
import { CreationPageComponent } from './creation-page.component';

describe('CreationPageComponent', () => {
    let component: CreationPageComponent;
    let fixture: ComponentFixture<CreationPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CreationPageComponent, ImageCanvasComponent],
            imports: [MatDialogModule, MatRadioModule, MatIconModule, FormsModule, HttpClientTestingModule],
            providers: [
                {
                    provide: MatDialog,
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CreationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
