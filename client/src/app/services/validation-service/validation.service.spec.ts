import { TestBed } from '@angular/core/testing';
import { IMG_HEIGHT, IMG_TYPE, IMG_WIDTH, VALID_BMP_SIZE } from '@app/constants/image';
// import { IMG_TYPE, VALID_BMP_SIZE } from '@app/constants/image';
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

    it('isImageValid should return true when given a valid image', () => {
        spyOn(service, 'isImageTypeValid').and.returnValue(true);
        spyOn(service, 'isImageSizeValid').and.returnValue(true);
        spyOn(service, 'isImageFormatValid').and.returnValue(true);
        const file = new File([''], 'filename', { type: IMG_TYPE });
        const mockInputElement = document.createElement('input');
        mockInputElement.width = IMG_WIDTH;
        mockInputElement.height = IMG_HEIGHT;
        expect(service.isImageValid(file, mockInputElement)).toBeTruthy();
    });

    it('isImageValid should return false when given a invalid image', () => {
        spyOn(service, 'isImageTypeValid').and.returnValue(true);
        spyOn(service, 'isImageSizeValid').and.returnValue(true);
        spyOn(service, 'isImageFormatValid').and.returnValue(false);
        const file = new File([''], 'filename', { type: IMG_TYPE });
        const mockInputElement = document.createElement('input');
        mockInputElement.width = IMG_WIDTH;
        mockInputElement.height = IMG_HEIGHT;
        expect(service.isImageValid(file, mockInputElement)).toBeFalsy();
    });

    it('isImageTypeValid should return false when given the wrong image type', () => {
        const file = new File([''], 'filename', { type: 'image/png' });
        expect(service.isImageTypeValid(file)).toBeFalsy();
    });

    it('isImageTypeValid should return true when given the right image type', () => {
        const file = new File([''], 'filename', { type: IMG_TYPE });
        expect(service.isImageTypeValid(file)).toBeTruthy();
    });

    it('isImageSizeValid should return true when given the right image size', () => {
        const target = { width: IMG_WIDTH, height: IMG_HEIGHT };
        expect(service.isImageSizeValid(target as HTMLInputElement)).toBeTruthy();
    });

    it('isImageSizeValid should return false when given the wrong image size', () => {
        const mockInputElement: HTMLInputElement = document.createElement('input');
        mockInputElement.width = IMG_WIDTH + 1;
        mockInputElement.height = IMG_HEIGHT - 1;
        expect(service.isImageSizeValid(mockInputElement)).toBeFalsy();
    });

    it('isImageSizeValid should return false when given the wrong height', () => {
        const mockInputElement: HTMLInputElement = document.createElement('input');
        mockInputElement.width = IMG_WIDTH - 1;
        mockInputElement.height = IMG_HEIGHT;
        expect(service.isImageSizeValid(mockInputElement)).toBeFalsy();
    });

    it('isImageSizeValid should return false when given the wrong width', () => {
        const mockInputElement: HTMLInputElement = document.createElement('input');
        mockInputElement.width = IMG_WIDTH;
        mockInputElement.height = IMG_HEIGHT - 1;
        expect(service.isImageSizeValid(mockInputElement)).toBeFalsy();
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
