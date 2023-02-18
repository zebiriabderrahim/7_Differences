import { TestBed } from '@angular/core/testing';
import { IMG_HEIGHT, IMG_WIDTH, VALID_BMP_SIZE } from '@app/constants/image';
import { ImageService } from '@app/services/image-service/image.service';
import { of } from 'rxjs';
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
    let service: ValidationService;

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
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('isImageTypeValid should return false when given the wrong image type', () => {
        const file = new File([''], 'filename', { type: 'image/png' });
        expect(service.isImageTypeValid(file)).toBeFalsy();
    });

    it('isImageTypeValid should return true when given the right image type', () => {
        const file = new File([''], 'filename', { type: 'image/bmp' });
        expect(service.isImageTypeValid(file)).toBeTruthy();
    });

    it('isImageSizeValid should return true when given the right image size', async () => {
        const image: ImageBitmap = {
            width: IMG_WIDTH,
            height: IMG_HEIGHT,
            // eslint-disable-next-line prefer-arrow/prefer-arrow-functions -- needed to create bitmap Image
            close(): () => void {
                throw new Error('Function not implemented.');
            },
        };
        expect(service.isImageSizeValid(image)).toBeTruthy();
    });

    it('isImageSizeValid should return false when given the wrong image size', async () => {
        const image: ImageBitmap = {
            width: IMG_WIDTH + 1,
            height: IMG_HEIGHT - 1,
            // eslint-disable-next-line prefer-arrow/prefer-arrow-functions -- needed to create bitmap Image
            close(): void {
                throw new Error('Function not implemented.');
            },
        };
        expect(service.isImageSizeValid(image)).toBeFalsy();
    });

    it('isImageFormatValid should return true when given an valid image', () => {
        const file = new File([new Uint8Array(VALID_BMP_SIZE)], 'example.bmp');
        expect(service.isImageFormatValid(file)).toBeTruthy();
    });

    it('isImageFormatValid should return false when given an invalid image', () => {
        const file = new File([], 'filename.png', { type: 'image/png' });
        expect(service.isImageFormatValid(file)).toBeFalsy();
    });
});
