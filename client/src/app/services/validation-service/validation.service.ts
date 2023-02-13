import { Injectable } from '@angular/core';
import { BMP_HEADER_OFFSET, FORMAT_IMAGE, IMG_HEIGHT, IMG_TYPE, IMG_WIDTH } from '@app/constants/creation-page';

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

    async isImageFormatValid(file: File): Promise<boolean> {
        const bmpHeader = new DataView(await file.arrayBuffer());
        return bmpHeader.getUint16(BMP_HEADER_OFFSET, true) === FORMAT_IMAGE;
    }
}
