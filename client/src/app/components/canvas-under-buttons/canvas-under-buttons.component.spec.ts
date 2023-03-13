import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IMG_TYPE } from '@app/constants/image';
import { CanvasPosition } from '@app/enum/canvas-position';
import { ForegroundService } from '@app/services/foreground-service/foreground.service';
import { ImageService } from '@app/services/image-service/image.service';
import { ValidationService } from '@app/services/validation-service/validation.service';
import { CanvasUnderButtonsComponent } from './canvas-under-buttons.component';

describe('CanvasUnderButtonsComponent', () => {
    let component: CanvasUnderButtonsComponent;
    let fixture: ComponentFixture<CanvasUnderButtonsComponent>;
    let imageServiceSpy: jasmine.SpyObj<ImageService>;
    let foregroundServiceSpy: jasmine.SpyObj<ForegroundService>;
    let matDialogSpy: jasmine.SpyObj<MatDialog>;
    let validationServiceSpy: jasmine.SpyObj<ValidationService>;

    beforeEach(async () => {
        imageServiceSpy = jasmine.createSpyObj('ImageService', ['setBackground', 'resetBackground']);
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        foregroundServiceSpy = jasmine.createSpyObj('ForegroundService', ['resetForeground']);
        validationServiceSpy = jasmine.createSpyObj('ValidationService', ['isImageValid']);
        await TestBed.configureTestingModule({
            imports: [MatDialogModule, HttpClientTestingModule, MatIconModule, MatButtonModule, MatTooltipModule],
            declarations: [CanvasUnderButtonsComponent],
            providers: [
                { provide: MatDialog, useValue: matDialogSpy },
                { provide: ImageService, useValue: imageServiceSpy },
                { provide: ForegroundService, useValue: foregroundServiceSpy },
                { provide: ValidationService, useValue: validationServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CanvasUnderButtonsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onSelectFile does not call isImageValid or invalidMatDialog if theres no files selected', () => {
        const event = {
            target: {
                files: [],
            } as unknown as HTMLInputElement,
        } as unknown as Event;

        component.onSelectFile(event);
        expect(validationServiceSpy.isImageValid).not.toHaveBeenCalled();
        expect(matDialogSpy.open).not.toHaveBeenCalled();
    });

    it('onSelectFile should open the invalidImageDialog when given an invalid type image and should not call imageService setBackground', () => {
        const event = {
            target: {
                files: [new Blob()],
            } as unknown as HTMLInputElement,
        } as unknown as Event;

        validationServiceSpy.isImageValid.and.returnValue(false);

        component.onSelectFile(event);
        expect(matDialogSpy.open).toHaveBeenCalled();
        expect(imageServiceSpy.setBackground).not.toHaveBeenCalled();
    });

    it('onSelectFile should not open the invalidImageDialog when given an valid image and should call imageService setBackground', async () => {
        const mockFile = new File([''], 'filename', { type: IMG_TYPE });
        const mockImage = {} as ImageBitmap;
        spyOn(window, 'createImageBitmap').and.callFake(async () => {
            return mockImage;
        });
        const event = {
            target: {
                files: [mockFile],
            } as unknown as HTMLInputElement,
        } as unknown as Event;

        validationServiceSpy.isImageValid.and.returnValue(true);

        await component.onSelectFile(event);
        expect(matDialogSpy.open).not.toHaveBeenCalled();
        expect(imageServiceSpy.setBackground).toHaveBeenCalled();
    });

    it('resetForeground should call foregroundService.resetForeground with the right Position', () => {
        component.canvasPositionType = CanvasPosition.Left;
        component.resetForeground();
        expect(foregroundServiceSpy.resetForeground).toHaveBeenCalledWith(component.canvasPositionType);
    });

    it('resetBackground should call imageService.resetBackground with the right Position', () => {
        component.canvasPositionType = CanvasPosition.Left;
        component.resetBackground();
        expect(imageServiceSpy.resetBackground).toHaveBeenCalledWith(component.canvasPositionType);
    });
});
