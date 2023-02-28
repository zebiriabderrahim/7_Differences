import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CanvasUnderButtonsComponent } from '@app/components/canvas-under-buttons/canvas-under-buttons.component';
import { ImageService } from '@app/services/image-service/image.service';
import { ImageCanvasComponent } from './image-canvas.component';

describe('ImageCanvasComponent', () => {
    let component: ImageCanvasComponent;
    let fixture: ComponentFixture<ImageCanvasComponent>;
    let imageService: ImageService;
    // let contextStub: CanvasRenderingContext2D;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ImageCanvasComponent, CanvasUnderButtonsComponent],
            imports: [
                NoopAnimationsModule,
                MatDialogModule,
                MatInputModule,
                MatIconModule,
                MatTooltipModule,
                MatButtonToggleModule,
                HttpClientTestingModule,
                MatFormFieldModule,
                MatSelectModule,
                FormsModule,
                ReactiveFormsModule,
            ],
            providers: [
                {
                    provide: MatDialog,
                },
            ],
        }).compileComponents();
        imageService = TestBed.inject(ImageService);
        fixture = TestBed.createComponent(ImageCanvasComponent);
        // contextStub = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call imageService.setBackgroundContext with appropriate values', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for spy
        const imageServiceSpy = spyOn(imageService, 'setBackgroundContext').and.callFake(() => {});

        component.ngAfterViewInit();
        expect(imageServiceSpy).toHaveBeenCalled();
    });

    // it('should call get Context of backgroundCanvas', () => {
    //     spyOn(component.backgroundCanvas.nativeElement, 'getContext').and.returnValue(contextStub);
    //     component.ngAfterViewInit();
    //     expect(component.backgroundCanvas.nativeElement.getContext).toHaveBeenCalled();
    //     expect(component.backgroundContext).toEqual(contextStub);
    // });
});
