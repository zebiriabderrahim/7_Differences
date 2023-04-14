import { TestBed } from '@angular/core/testing';
import { IMG_HEIGHT, IMG_TYPE, IMG_WIDTH } from '@app/constants/image';
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
    let service: ValidationService;
    let testFile: File;

    beforeEach(() => {
        testFile = new File([''], 'test.bmp', { type: IMG_TYPE });
        TestBed.configureTestingModule({
            providers: [],
        }).compileComponents();
        service = TestBed.inject(ValidationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('isImageValid should validate a correct image', async () => {
        const image = await fetch('assets/gros-ratata.bmp');
        const blob = await image.blob();
        const imageFile = new File([blob], 'image.bmp', blob);

        const result = await service.isImageValid(imageFile);
        expect(result).toBe(true);
    });

    it('isImageValid should return false if the file type is not a BMP', async () => {
        testFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
        const result = await service.isImageValid(testFile);
        expect(result).toBeFalse();
    });

    it('isImageValid should return false if the image size is not valid', async () => {
        spyOn(service, 'isImageSizeValid').and.returnValue(Promise.resolve(false));
        const result = await service.isImageValid(testFile);
        expect(result).toBeFalse();
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
});
