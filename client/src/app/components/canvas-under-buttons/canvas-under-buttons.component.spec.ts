/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
// import { IMG_HEIGHT, IMG_TYPE, IMG_WIDTH } from '@app/constants/creation-page';
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

    it('set ImageIfValid should open the invalidImageDialog when given an invalid type image and should not set the image', () => {
        spyOn(validationService, 'isImageTypeValid').and.callFake(() => {
            return false;
        });
        const imageServiceResetBackgroundSpy = spyOn(imageService, 'setBackground');

        component.setImageIfValid(new Image());
        expect(matDialogSpy.open).toHaveBeenCalled();
        expect(imageServiceResetBackgroundSpy).not.toHaveBeenCalled();
    });

    // it('set ImageIfValid should not open the invalidImageDialog when given an valid type image and should set the image', () => {
    //     spyOn(validationService, 'isImageSizeValid').and.callFake(() => {
    //         return true;
    //     });
    //     spyOn(validationService, 'isImageTypeValid').and.callFake(() => {
    //         return true;
    //     });
    //     spyOn(validationService, 'isImageFormatValid').and.callFake(() => {
    //         return true;
    //     });
    //     const imageServiceResetBackgroundSpy = spyOn(imageService, 'setBackground').and.callFake(() => {});

    //     component.setImageIfValid(new Image());
    //     expect(matDialogSpy.open).not.toHaveBeenCalled();
    //     expect(imageServiceResetBackgroundSpy).toHaveBeenCalled();
    // });

    it('resetBackground should call imageService.resetBackground with the right Position', () => {
        component.position = CanvasPosition.Left;
        const imageServiceResetBackgroundSpy = spyOn(imageService, 'resetBackground').and.callFake(() => {});
        component.resetBackground();
        expect(imageServiceResetBackgroundSpy).toHaveBeenCalledWith(component.position);
    });

    // it('isImageSizeValid should return true when given the right image size', () => {
    //     const event: Event = {
    //         target: { width: IMG_WIDTH, height: IMG_HEIGHT } as HTMLInputElement,
    //         bubbles: false,
    //         cancelBubble: false,
    //         cancelable: false,
    //         composed: false,
    //         currentTarget: null,
    //         defaultPrevented: false,
    //         eventPhase: 0,
    //         isTrusted: false,
    //         returnValue: false,
    //         srcElement: null,
    //         timeStamp: 0,
    //         type: '',
    //         composedPath(): EventTarget[] {
    //             throw new Error('Function not implemented.');
    //         },
    //         // eslint-disable-next-line no-unused-vars
    //         initEvent(_type: string, _bubbles?: boolean | undefined, cancelable?: boolean | undefined): void {
    //             throw new Error('Function not implemented.');
    //         },
    //         preventDefault(): void {
    //             throw new Error('Function not implemented.');
    //         },
    //         stopImmediatePropagation(): void {
    //             throw new Error('Function not implemented.');
    //         },
    //         stopPropagation(): void {
    //             throw new Error('Function not implemented.');
    //         },
    //         AT_TARGET: 0,
    //         BUBBLING_PHASE: 0,
    //         CAPTURING_PHASE: 0,
    //         NONE: 0,
    //     };
    //     expect(component.isImageSizeValid(event)).toBeTruthy();
    // });

    // it('isImageSizeValid should return false when given the wrong image size', () => {
    //     const event: Event = {
    //         target: { width: IMG_WIDTH + 1, height: IMG_HEIGHT - 1 } as HTMLInputElement,
    //         bubbles: false,
    //         cancelBubble: false,
    //         cancelable: false,
    //         composed: false,
    //         currentTarget: null,
    //         defaultPrevented: false,
    //         eventPhase: 0,
    //         isTrusted: false,
    //         returnValue: false,
    //         srcElement: null,
    //         timeStamp: 0,
    //         type: '',
    //         composedPath(): EventTarget[] {
    //             throw new Error('Function not implemented.');
    //         },
    //         // eslint-disable-next-line no-unused-vars
    //         initEvent(_type: string, _bubbles?: boolean | undefined, cancelable?: boolean | undefined): void {
    //             throw new Error('Function not implemented.');
    //         },
    //         preventDefault(): void {
    //             throw new Error('Function not implemented.');
    //         },
    //         stopImmediatePropagation(): void {
    //             throw new Error('Function not implemented.');
    //         },
    //         stopPropagation(): void {
    //             throw new Error('Function not implemented.');
    //         },
    //         AT_TARGET: 0,
    //         BUBBLING_PHASE: 0,
    //         CAPTURING_PHASE: 0,
    //         NONE: 0,
    //     };
    //     expect(component.isImageSizeValid(event)).toBeFalsy();
    // });
});
