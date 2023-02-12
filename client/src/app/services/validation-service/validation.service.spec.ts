import { TestBed } from '@angular/core/testing';
import { ARRAY_BUFFER_OFFSET, BMP_HEADER_OFFSET, FORMAT_IMAGE, IMG_HEIGHT, IMG_WIDTH } from '@app/constants/creation-page';
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
            close(): void {
                throw new Error('Function not implemented.');
            },
        };
        expect(service.isImageSizeValid(image)).toBeTruthy();
    });

    it('isImageSizeValid should return false when given the wrong image size', async () => {
        const image: ImageBitmap = {
            width: IMG_WIDTH + 1,
            height: IMG_HEIGHT - 1,
            close(): void {
                throw new Error('Function not implemented.');
            },
        };
        expect(service.isImageSizeValid(image)).toBeFalsy();
    });

    it('isImageFormatValid should return true if the image format is valid', async () => {
        const file = {
            arrayBuffer: async () => Promise.resolve(new ArrayBuffer(ARRAY_BUFFER_OFFSET)),
        };
        spyOn(DataView.prototype, 'getUint16').and.returnValue(FORMAT_IMAGE);

        const result = await service.isImageFormatValid(file as File);
        expect(result).toBeTruthy();
    });

    it('isImageFormatValid should return false if the image format is invalid', async () => {
        const file = {
            arrayBuffer: async () => Promise.resolve(new ArrayBuffer(ARRAY_BUFFER_OFFSET)),
        };
        spyOn(DataView.prototype, 'getUint16').and.returnValue(BMP_HEADER_OFFSET + 1);

        const result = await service.isImageFormatValid(file as File);
        expect(result).toBeFalsy();
    });
});
