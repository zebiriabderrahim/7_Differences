/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { TestBed } from '@angular/core/testing';
import { IMG_HEIGHT, IMG_TYPE, IMG_WIDTH } from '@app/constants/creation-page';
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
    let service: ValidationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ValidationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
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
});
