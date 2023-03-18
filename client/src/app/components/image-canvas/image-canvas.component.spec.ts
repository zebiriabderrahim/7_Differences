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
import { CanvasTopButtonsComponent } from '@app/components/canvas-top-buttons/canvas-top-buttons.component';
import { CanvasUnderButtonsComponent } from '@app/components/canvas-under-buttons/canvas-under-buttons.component';
import { LEFT_BUTTON } from '@app/constants/constants';
import { CanvasPosition } from '@app/enum/canvas-position';
import { DrawService } from '@app/services/draw-service/draw.service';
import { ForegroundService } from '@app/services/foreground-service/foreground.service';
import { ImageService } from '@app/services/image-service/image.service';
import { ImageCanvasComponent } from './image-canvas.component';

describe('ImageCanvasComponent', () => {
    let component: ImageCanvasComponent;
    let fixture: ComponentFixture<ImageCanvasComponent>;
    let imageServiceSpy: jasmine.SpyObj<ImageService>;
    let foregroundServiceSpy: jasmine.SpyObj<ForegroundService>;
    let drawServiceSpy: jasmine.SpyObj<DrawService>;

    beforeEach(async () => {
        imageServiceSpy = jasmine.createSpyObj('ImageService', ['setBackgroundContext']);
        foregroundServiceSpy = jasmine.createSpyObj('ForegroundService', [
            'setForegroundContext',
            'startForegroundOperation',
            'stopForegroundOperation',
        ]);
        drawServiceSpy = jasmine.createSpyObj('DrawService', ['setSquareMode', 'mouseIsOutOfCanvas', 'continueCanvasOperation']);
        await TestBed.configureTestingModule({
            declarations: [ImageCanvasComponent, CanvasTopButtonsComponent, CanvasUnderButtonsComponent],
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
                {
                    provide: ImageService,
                    useValue: imageServiceSpy,
                },
                {
                    provide: ForegroundService,
                    useValue: foregroundServiceSpy,
                },
                {
                    provide: DrawService,
                    useValue: drawServiceSpy,
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

    it('should call imageService.setBackgroundContext and foregroundService.setForegroundContext on ngAfterViewInit', () => {
        component.ngAfterViewInit();
        expect(imageServiceSpy.setBackgroundContext).toHaveBeenCalled();
        expect(foregroundServiceSpy.setForegroundContext).toHaveBeenCalled();
    });

    it('pressing shift key should call drawService.setSquareMode with true', () => {
        const onShiftDownSpy = spyOn(component, 'onShiftDown').and.callThrough();
        const mockShiftDownEvent = new KeyboardEvent('keydown', { key: 'Shift' });
        window.dispatchEvent(mockShiftDownEvent);
        expect(onShiftDownSpy).toHaveBeenCalled();
        expect(drawServiceSpy.setSquareMode).toHaveBeenCalledOnceWith(true);
    });

    it('releasing shift key should call drawService.setSquareMode with false', () => {
        const onShiftUpSpy = spyOn(component, 'onShiftUp').and.callThrough();
        const mockShiftUpEvent = new KeyboardEvent('keyup', { key: 'Shift' });
        window.dispatchEvent(mockShiftUpEvent);
        expect(onShiftUpSpy).toHaveBeenCalled();
        expect(drawServiceSpy.setSquareMode).toHaveBeenCalledOnceWith(false);
    });

    it('onMouseLeavingCanvas should call drawService.mouseIsOutOfCanvas when called with appropriate event', () => {
        const mockMouseClickEvent: MouseEvent = { button: LEFT_BUTTON } as MouseEvent;
        component.onMouseLeavingCanvas(mockMouseClickEvent);
        expect(drawServiceSpy.mouseIsOutOfCanvas).toHaveBeenCalled();
    });

    it('onMouseLeavingCanvas should not call drawService.mouseIsOutOfCanvas when called with inappropriate event', () => {
        const mockMouseClickEvent: MouseEvent = { button: -1 } as MouseEvent;
        component.onMouseLeavingCanvas(mockMouseClickEvent);
        expect(drawServiceSpy.mouseIsOutOfCanvas).not.toHaveBeenCalled();
    });

    it('continueCanvasOperation should call drawService.continueCanvasOperation with appropriate values', () => {
        const mockMouseClickEvent: MouseEvent = new MouseEvent('mousemove');
        const mockCanvasPosition = CanvasPosition.Left;
        component['position'] = mockCanvasPosition;
        component.continueCanvasOperation(mockMouseClickEvent);
        expect(drawServiceSpy.continueCanvasOperation).toHaveBeenCalledOnceWith(mockCanvasPosition, mockMouseClickEvent);
    });

    it('startCanvasOperation should call foregroundService.startForegroundOperation with appropriate values', () => {
        const mockMouseClickEvent: MouseEvent = new MouseEvent('mousemove');
        const mockCanvasPosition = CanvasPosition.Left;
        component['position'] = mockCanvasPosition;
        component.startCanvasOperation(mockMouseClickEvent);
        expect(foregroundServiceSpy.startForegroundOperation).toHaveBeenCalledOnceWith(mockCanvasPosition, mockMouseClickEvent);
    });

    it('stopCanvasOperation should call foregroundService.stopForegroundOperation with appropriate values', () => {
        const mockMouseClickEvent: MouseEvent = new MouseEvent('mousemove');
        const mockCanvasPosition = CanvasPosition.Left;
        component['position'] = mockCanvasPosition;
        component.stopCanvasOperation(mockMouseClickEvent);
        expect(foregroundServiceSpy.stopForegroundOperation).toHaveBeenCalledOnceWith(mockCanvasPosition, mockMouseClickEvent);
    });
});
