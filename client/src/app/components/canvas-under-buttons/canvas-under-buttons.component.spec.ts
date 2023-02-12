import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { IMG_TYPE } from '@app/constants/creation-page';
import { CanvasPosition } from '@app/enum/canvas-position';
import { ImageService } from '@app/services/image-service/image.service';
import { ValidationService } from '@app/services/validation-service/validation.service';
import { CanvasUnderButtonsComponent } from './canvas-under-buttons.component';

describe('CanvasUnderButtonsComponent', () => {
    let component: CanvasUnderButtonsComponent;
    let fixture: ComponentFixture<CanvasUnderButtonsComponent>;
    let imageService: ImageService;
    let matDialogSpy: jasmine.SpyObj<MatDialog>;
    let validationService: ValidationService;

    beforeEach(async () => {
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        await TestBed.configureTestingModule({
            imports: [MatDialogModule, HttpClientTestingModule, MatIconModule, MatButtonModule],
            declarations: [CanvasUnderButtonsComponent],
            providers: [{ provide: MatDialog, useValue: matDialogSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(CanvasUnderButtonsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        imageService = TestBed.inject(ImageService);
        validationService = TestBed.inject(ValidationService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onSelectFile does not call setImageIfValid or invalidMatDialog if theres no files selected', () => {
        const event = {
            target: {
                files: [],
            } as unknown as HTMLInputElement,
        } as unknown as Event;

        const setImageIfValidSpy = spyOn(component, 'setImageIfValid');
        component.onSelectFile(event);
        expect(setImageIfValidSpy).not.toHaveBeenCalled();
        expect(matDialogSpy.open).not.toHaveBeenCalled();
    });

    it('onSelectFile should open the invalidImageDialog when given an invalid type image and should not call setImageIfValid', () => {
        const event = {
            target: {
                files: [new Blob()],
            } as unknown as HTMLInputElement,
        } as unknown as Event;

        spyOn(validationService, 'isImageTypeValid').and.callFake(() => {
            return false;
        });
        const setImageIfValidSpy = spyOn(component, 'setImageIfValid');

        component.onSelectFile(event);
        expect(matDialogSpy.open).toHaveBeenCalled();
        expect(setImageIfValidSpy).not.toHaveBeenCalled();
    });

    it('onSelectFile should not open the invalidImageDialog when given an valid image and should call setImageIfValid', () => {
        const mockFile = new File([''], 'filename', { type: IMG_TYPE });
        const event = {
            target: {
                files: [mockFile],
            } as unknown as HTMLInputElement,
        } as unknown as Event;

        spyOn(validationService, 'isImageTypeValid').and.callFake(() => {
            return true;
        });
        spyOn(validationService, 'isImageFormatValid').and.callFake(async () => {
            return true as unknown as Promise<boolean>;
        });
        const setImageIfValidSpy = spyOn(component, 'setImageIfValid');

        component.onSelectFile(event);
        expect(matDialogSpy.open).not.toHaveBeenCalled();
        expect(setImageIfValidSpy).toHaveBeenCalledOnceWith(mockFile);
    });

    it('setImageIfValid should open the invalidImageDialog when given an invalid type image and should not set the image', async () => {
        spyOn(validationService, 'isImageSizeValid').and.callFake(() => {
            return false;
        });
        spyOn(validationService, 'isImageFormatValid').and.callFake(async () => {
            return false;
        });
        const mockImage = {} as ImageBitmap;
        spyOn(window, 'createImageBitmap').and.callFake(async () => {
            return mockImage;
        });
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const imageServiceSetBackgroundSpy = spyOn(imageService, 'setBackground').and.callFake(() => {});
        await component.setImageIfValid(new File([''], 'filename', { type: 'pdf' }));
        expect(matDialogSpy.open).toHaveBeenCalled();
        expect(imageServiceSetBackgroundSpy).not.toHaveBeenCalled();
    });

    it('setImageIfValid should not open the invalidImageDialog when given an valid type image and setBackGround', async () => {
        const mockImage = {} as ImageBitmap;
        spyOn(window, 'createImageBitmap').and.callFake(async () => {
            return mockImage;
        });
        spyOn(validationService, 'isImageSizeValid').and.callFake(() => {
            return true;
        });
        spyOn(validationService, 'isImageFormatValid').and.callFake(async () => {
            return true;
        });
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const imageServiceSetBackgroundSpy = spyOn(imageService, 'setBackground').and.callFake(() => {});

        await component.setImageIfValid(new File([''], 'filename', { type: IMG_TYPE }));
        expect(matDialogSpy.open).not.toHaveBeenCalled();
        expect(imageServiceSetBackgroundSpy).toHaveBeenCalledOnceWith(component.position, mockImage);
    });

    it('resetBackground should call imageService.resetBackground with the right Position', () => {
        component.position = CanvasPosition.Left;
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- needed for empty callFake
        const imageServiceResetBackgroundSpy = spyOn(imageService, 'resetBackground').and.callFake(() => {});
        component.resetBackground();
        expect(imageServiceResetBackgroundSpy).toHaveBeenCalledWith(component.position);
    });
});