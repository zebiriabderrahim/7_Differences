import { Injectable } from '@angular/core';
import { VALID_BMP_SIZE } from '@app/constants/constants';
import { IMG_HEIGHT, IMG_TYPE, IMG_WIDTH } from '@app/constants/creation-page';

@Injectable({
    providedIn: 'root',
})
export class ValidationService {
    isImageTypeValid(file: File): boolean {
        return file.type === IMG_TYPE;
    }

    isImageSizeValid(image: ImageBitmap): boolean {
        return image.width === IMG_WIDTH && image.height === IMG_HEIGHT;
    }

    isImageFormatValid(file: File): boolean {
        return file.size === VALID_BMP_SIZE;
    }
}
