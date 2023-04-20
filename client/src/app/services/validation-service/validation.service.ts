import { Injectable } from '@angular/core';
import { IMG_HEIGHT, IMG_TYPE, IMG_WIDTH, VALID_BMP_SIZE } from '@app/constants/image';

@Injectable({
    providedIn: 'root',
})
export class ValidationService {
    async isImageValid(file: File): Promise<boolean> {
        return file.type === IMG_TYPE && (await this.isImageSizeValid(file)) && file.size === VALID_BMP_SIZE;
    }

    private async isImageSizeValid(file: File): Promise<boolean> {
        const image = await createImageBitmap(file);
        return image.width === IMG_WIDTH && image.height === IMG_HEIGHT;
    }
}
