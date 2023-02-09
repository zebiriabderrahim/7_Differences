/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { IMG_HEIGHT, IMG_TYPE, IMG_WIDTH } from '@app/constants/creation-page';
import { CanvasPosition } from '@app/enum/canvas-position';
import { ImageService } from '@app/services/image-service/image.service';
import { CanvasUnderButtonsComponent } from './canvas-under-buttons.component';

describe('CanvasUnderButtonsComponent', () => {
    let component: CanvasUnderButtonsComponent;
    let fixture: ComponentFixture<CanvasUnderButtonsComponent>;
    let imageService: ImageService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule, HttpClientTestingModule, MatIconModule, MatButtonModule],
            declarations: [CanvasUnderButtonsComponent],
            providers: [
                {
                    provide: MatDialog,
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CanvasUnderButtonsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        imageService = TestBed.inject(ImageService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('isImageTypeValid should return false when given the wrong image type', () => {
        expect(component.isImageTypeValid('png')).toBeFalsy();
    });

    it('isImageTypeValid should return true when given the right image type', () => {
        expect(component.isImageTypeValid(IMG_TYPE)).toBeTruthy();
    });

    // TODO refactor isImageSizeValid tests
    it('isImageSizeValid should return true when given the right image size', () => {
        const event: Event = {
            target: { width: IMG_WIDTH, height: IMG_HEIGHT } as HTMLInputElement,
            bubbles: false,
            cancelBubble: false,
            cancelable: false,
            composed: false,
            currentTarget: null,
            defaultPrevented: false,
            eventPhase: 0,
            isTrusted: false,
            returnValue: false,
            srcElement: null,
            timeStamp: 0,
            type: '',
            composedPath(): EventTarget[] {
                throw new Error('Function not implemented.');
            },
            // eslint-disable-next-line no-unused-vars
            initEvent(_type: string, _bubbles?: boolean | undefined, cancelable?: boolean | undefined): void {
                throw new Error('Function not implemented.');
            },
            preventDefault(): void {
                throw new Error('Function not implemented.');
            },
            stopImmediatePropagation(): void {
                throw new Error('Function not implemented.');
            },
            stopPropagation(): void {
                throw new Error('Function not implemented.');
            },
            AT_TARGET: 0,
            BUBBLING_PHASE: 0,
            CAPTURING_PHASE: 0,
            NONE: 0,
        };
        expect(component.isImageSizeValid(event)).toBeTruthy();
    });

    it('isImageSizeValid should return false when given the wrong image size', () => {
        const event: Event = {
            target: { width: IMG_WIDTH + 1, height: IMG_HEIGHT - 1 } as HTMLInputElement,
            bubbles: false,
            cancelBubble: false,
            cancelable: false,
            composed: false,
            currentTarget: null,
            defaultPrevented: false,
            eventPhase: 0,
            isTrusted: false,
            returnValue: false,
            srcElement: null,
            timeStamp: 0,
            type: '',
            composedPath(): EventTarget[] {
                throw new Error('Function not implemented.');
            },
            // eslint-disable-next-line no-unused-vars
            initEvent(_type: string, _bubbles?: boolean | undefined, cancelable?: boolean | undefined): void {
                throw new Error('Function not implemented.');
            },
            preventDefault(): void {
                throw new Error('Function not implemented.');
            },
            stopImmediatePropagation(): void {
                throw new Error('Function not implemented.');
            },
            stopPropagation(): void {
                throw new Error('Function not implemented.');
            },
            AT_TARGET: 0,
            BUBBLING_PHASE: 0,
            CAPTURING_PHASE: 0,
            NONE: 0,
        };
        expect(component.isImageSizeValid(event)).toBeFalsy();
    });

    it('isImageFormatValid should return true when image format is valid', () => {
        const imageDescription = 'data:image/bmp;base64,Qk02EA4AAAAAADYAAAAoAAAAgAIAAOABAAABABgAAAAAAAAQDgDEDgAAxA4AAAAAAAAAAAAA';
        expect(component.isImageFormatValid(imageDescription)).toBeTruthy();
    });

    it('isImageFormatValid should return false when image format is not valid', () => {
        const imageDescription = 'data:image/bmp;base64,def';
        expect(component.isImageFormatValid(imageDescription)).toBeFalsy();
    });

    it('resetBackground should call imageService.resetBackground with the right Position', () => {
        component.position = CanvasPosition.Left;
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const imageServiceResetBackgroundSpy = spyOn(imageService, 'resetBackground').and.callFake(() => {});
        component.resetBackground();
        expect(imageServiceResetBackgroundSpy).toHaveBeenCalledWith(component.position);
    });
});
