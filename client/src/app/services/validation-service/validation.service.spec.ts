/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { TestBed } from '@angular/core/testing';
import { IMG_HEIGHT, IMG_TYPE, IMG_WIDTH } from '@app/constants/creation-page';
import { ImageService } from '@app/services/image-service/image.service';
import { of } from 'rxjs';
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
    let service: ValidationService;
    let imageService: ImageService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: ImageService,
                    useValue: jasmine.createSpyObj('ImageService', {
                        imageService: of({ leftBackground: 'left', rightBackground: 'right' }),
                    }),
                },
            ],
        }).compileComponents();
        service = TestBed.inject(ValidationService);
        imageService = TestBed.inject(ImageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('areImagesSet should return true if both leftBackground and rightBackground are set', () => {
        expect(service.areImagesSet()).toBe(true);
    });

    it('areImagesSet should return false if either leftBackground or rightBackground is not set', () => {
        imageService.leftBackground = '';
        expect(service.areImagesSet()).toBe(false);
        imageService.leftBackground = 'left';
        imageService.rightBackground = '';
        expect(service.areImagesSet()).toBe(false);
    });

    it('isImageTypeValid should return false when given the wrong image type', () => {
        expect(service.isImageTypeValid('png')).toBeFalsy();
    });

    it('isImageTypeValid should return true when given the right image type', () => {
        expect(service.isImageTypeValid(IMG_TYPE)).toBeTruthy();
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
        expect(service.isImageSizeValid(event)).toBeTruthy();
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
        expect(service.isImageSizeValid(event)).toBeFalsy();
    });

    it('isImageFormatValid should return true when image format is valid', () => {
        const imageDescription = 'data:image/bmp;base64,Qk02EA4AAAAAADYAAAAoAAAAgAIAAOABAAABABgAAAAAAAAQDgDEDgAAxA4AAAAAAAAAAAAA';
        expect(service.isImageFormatValid(imageDescription)).toBe(true); // false
    });

    it('isImageFormatValid should return false when image format is not valid', () => {
        const imageDescription = 'data:image/bmp;base64,def';
        expect(service.isImageFormatValid(imageDescription)).toBe(false);
    });
});
