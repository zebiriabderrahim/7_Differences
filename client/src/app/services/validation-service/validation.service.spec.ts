/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { TestBed } from '@angular/core/testing';
import { IMG_HEIGHT, IMG_TYPE, IMG_WIDTH } from '@app/constants/creation-page';
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
        expect(service.isImageTypeValid('image/png')).toBeFalsy();
    });

    it('isImageTypeValid should return true when given the right image type', () => {
        expect(service.isImageTypeValid(IMG_TYPE)).toBeTruthy();
    });

    it('isImageSizeValid should return true when given the right image size', () => {
        const image = new Image(IMG_WIDTH, IMG_HEIGHT) as HTMLImageElement;
        expect(service.isImageSizeValid(image)).toBeTruthy();
    });

    it('isImageSizeValid should return false when given the wrong image size', () => {
        const image = new Image() as HTMLImageElement;
        expect(service.isImageSizeValid(image)).toBeFalsy();
    });

    // it('isImageSizeValid should return true when given the good image size', () => {
    //     const goodSizeImageSource = 'data:image/bmp;base64,Qk02EA4AAAAAADYAAAAoAAAAgAIAAOABAAABABgAAAAAAAAQDgDEDgAAxA4AAAAAAAAAAAAA';
    //     const goodSizeImage = new Image();
    //     goodSizeImage.src = goodSizeImageSource;
    //     expect(service.isImageSizeValid(goodSizeImage)).toBeTruthy();
    // });

    // it('isImageSizeValid should return false when given the wrong image size', () => {
    //     const wrongSizeImageSource = 'data:image/bmp;base64,Qk02EA4AAAAAADYAAAAoAAAAgAIAAOABAAABABgAAAAAAAAQDgDEDgAAxA4AAAAAAAAAAAAA';
    //     const wrongSizeImage = new Image();
    //     wrongSizeImage.src = badSizeImageSource;
    //     expect(service.isImageSizeValid(wrongSizeImage)).toBeTruthy();
    // });

    it('isImageFormatValid should return true when image format is valid', () => {
        const imageDescription = 'data:image/bmp;base64,Qk02EA4AAAAAADYAAAAoAAAAgAIAAOABAAABABgAAAAAAAAQDgDEDgAAxA4AAAAAAAAAAAAA';
        expect(service.isImageFormatValid(imageDescription)).toBeTruthy();
    });

    it('isImageFormatValid should return false when image format is not valid', () => {
        const imageDescription = 'data:image/bmp;base64,def';
        expect(service.isImageFormatValid(imageDescription)).toBeFalsy();
    });
});
