import { TestBed } from '@angular/core/testing';
import { IMG_HEIGHT, IMG_TYPE, IMG_WIDTH, VALID_BMP_SIZE } from '@app/constants/image';
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
    let service: ValidationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [],
        }).compileComponents();
        service = TestBed.inject(ValidationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('isImageValid should return true when given a valid image', async () => {
        spyOn(service, 'isImageTypeValid').and.returnValue(true);
        spyOn(service, 'isImageSizeValid').and.callFake(async () => {
            return true;
        });
        spyOn(service, 'isImageFormatValid').and.returnValue(true);
        const file = new File([''], 'filename', { type: IMG_TYPE });
        expect(await service.isImageValid(file)).toBeTruthy();
    });

    it('isImageValid should return false when given a invalid image', async () => {
        spyOn(service, 'isImageTypeValid').and.returnValue(true);
        spyOn(service, 'isImageSizeValid').and.callFake(async () => {
            return false;
        });
        spyOn(service, 'isImageFormatValid').and.returnValue(false);
        const file = new File([''], 'filename', { type: IMG_TYPE });
        expect(await service.isImageValid(file)).toBeFalsy();
    });

    it('isImageTypeValid should return false when given the wrong image type', () => {
        const file = new File([''], 'filename', { type: 'image/png' });
        expect(service.isImageTypeValid(file)).toBeFalsy();
    });

    it('isImageTypeValid should return true when given the right image type', () => {
        const file = new File([''], 'filename', { type: IMG_TYPE });
        expect(service.isImageTypeValid(file)).toBeTruthy();
    });

    it('isImageSizeValid should return true when given the right image size', async () => {
        const mockImage = { height: IMG_HEIGHT, width: IMG_WIDTH } as ImageBitmap;
        spyOn(window, 'createImageBitmap').and.callFake(async () => {
            return mockImage;
        });
        const file = new File([''], 'filename', { type: IMG_TYPE });
        expect(await service.isImageSizeValid(file)).toBeTruthy();
    });

    it('isImageSizeValid should return false when given the wrong image size', async () => {
        const mockImage = {} as ImageBitmap;
        spyOn(window, 'createImageBitmap').and.callFake(async () => {
            return mockImage;
        });
        const file = new File([''], 'filename', { type: IMG_TYPE });
        expect(await service.isImageSizeValid(file)).toBeFalsy();
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
