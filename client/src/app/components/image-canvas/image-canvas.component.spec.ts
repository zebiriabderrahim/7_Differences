import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { CanvasUnderButtonsComponent } from '@app/components/canvas-under-buttons/canvas-under-buttons.component';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { ImageService } from '@app/services/image-service/image.service';
import { ImageCanvasComponent } from './image-canvas.component';

describe('ImageCanvasComponent', () => {
    let component: ImageCanvasComponent;
    let fixture: ComponentFixture<ImageCanvasComponent>;
    let imageService: ImageService;
    let contextStub: CanvasRenderingContext2D;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ImageCanvasComponent, CanvasUnderButtonsComponent],
            imports: [MatDialogModule, MatIconModule, MatTooltipModule, HttpClientTestingModule],
            providers: [
                {
                    provide: MatDialog,
                },
            ],
        }).compileComponents();
        imageService = TestBed.inject(ImageService);
        fixture = TestBed.createComponent(ImageCanvasComponent);
        contextStub = CanvasTestHelper.createCanvas(IMG_WIDTH, IMG_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
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
        expect(imageServiceSpy).toHaveBeenCalledOnceWith(component.position, component.context);
    });

    it('should call get Context of backgroundCanvas', () => {
        spyOn(component.backgroundCanvas.nativeElement, 'getContext').and.returnValue(contextStub);
        component.ngAfterViewInit();
        expect(component.backgroundCanvas.nativeElement.getContext).toHaveBeenCalled();
        expect(component.context).toEqual(contextStub);
    });
});
