import { TestBed } from '@angular/core/testing';
import { IMG_TYPE } from '@app/constants/creation-page';
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
});
