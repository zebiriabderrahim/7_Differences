import { Injectable } from '@angular/core';
import { IMG_HEIGHT, IMG_TYPE, IMG_WIDTH, VALID_BMP_SIZE } from '@app/constants/image';

@Injectable({
    providedIn: 'root',
})
export class ValidationService {
    async isImageValid(file: File): Promise<boolean> {
        return this.isImageTypeValid(file) && (await this.isImageSizeValid(file)) && this.isImageFormatValid(file);
    }

    isImageTypeValid(file: File): boolean {
        return file.type === IMG_TYPE;
    }

    async isImageSizeValid(file: File): Promise<boolean> {
        const image = await createImageBitmap(file);
        return image.width === IMG_WIDTH && image.height === IMG_HEIGHT;
    }

    isImageFormatValid(file: File): boolean {
        return file.size === VALID_BMP_SIZE;
    }
}
