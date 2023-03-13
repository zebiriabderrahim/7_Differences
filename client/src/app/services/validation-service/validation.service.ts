import { Injectable } from '@angular/core';
import { IMG_HEIGHT, IMG_TYPE, IMG_WIDTH, VALID_BMP_SIZE } from '@app/constants/image';

@Injectable({
    providedIn: 'root',
})
export class ValidationService {
    isImageValid(file: File, target: HTMLInputElement): boolean {
        return this.isImageTypeValid(file) && this.isImageSizeValid(target) && this.isImageFormatValid(file);
    }

    isImageTypeValid(file: File): boolean {
        return file.type === IMG_TYPE;
    }

    isImageSizeValid(target: HTMLInputElement): boolean {
        return target.width === IMG_WIDTH && target.height === IMG_HEIGHT;
    }

    isImageFormatValid(file: File): boolean {
        return file.size === VALID_BMP_SIZE;
    }
}
