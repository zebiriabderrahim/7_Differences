import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
// import { CanvasPosition } from '@app/enum/canvas-position';
import { ImageCanvasComponent } from './image-canvas.component';

describe('ImageCanvasComponent', () => {
    let component: ImageCanvasComponent;
    let fixture: ComponentFixture<ImageCanvasComponent>;
    // let imageService: ImageService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ImageCanvasComponent],
            imports: [MatDialogModule, MatIconModule, HttpClientTestingModule],
            providers: [
                {
                    provide: MatDialog,
                },
            ],
        }).compileComponents();
        // imageService = TestBed.inject(ImageService);
        fixture = TestBed.createComponent(ImageCanvasComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // it('resetBackground should call imageService.resetBackground with the right Position', () => {
    //     component.position = CanvasPosition.Left;
    //     // eslint-disable-next-line @typescript-eslint/no-empty-function
    //     const imageServiceResetBackgroundSpy = spyOn(imageService, 'resetBackground').and.callFake(() => {});
    //     component.resetBackground();
    //     expect(imageServiceResetBackgroundSpy).toHaveBeenCalledWith(component.position);
    // });
});
