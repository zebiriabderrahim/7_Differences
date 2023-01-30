import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ImageCanvasComponent } from './image-canvas.component';

describe('ImageCanvasComponent', () => {
    let component: ImageCanvasComponent;
    let fixture: ComponentFixture<ImageCanvasComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ImageCanvasComponent],
            imports: [MatDialogModule, MatIconModule],
            providers: [
                {
                    provide: MatDialog,
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ImageCanvasComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
