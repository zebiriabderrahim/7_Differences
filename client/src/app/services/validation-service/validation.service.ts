import { Injectable } from '@angular/core';
import { BMP_HEADER_OFFSET, FORMAT_IMAGE, IMG_HEIGHT, IMG_TYPE, IMG_WIDTH } from '@app/constants/creation-page';

@Injectable({
    providedIn: 'root',
})
export class ValidationService {
    isImageTypeValid: boolean = false;
    isImageSizeValid: boolean = false;
    isImageFormatValid: boolean = false;

    validateImageType(imageDescription: string) {
        this.isImageTypeValid = imageDescription.includes(IMG_TYPE);
    }

    validateImageSize(event: Event) {
        const target = event.target as HTMLInputElement;
        this.isImageSizeValid = target.width === IMG_WIDTH && target.height === IMG_HEIGHT;
    }

    async validateImageFormat(file: File) {
        const bmpHeader = new DataView(await file.arrayBuffer());
        const bmpFormat = bmpHeader.getUint16(BMP_HEADER_OFFSET, true);
        this.isImageFormatValid = bmpFormat === FORMAT_IMAGE;
    }

    validateImage(file: File, event: Event, imageDescription: string) {
        this.validateImageType(imageDescription);
        this.validateImageSize(event);
        this.validateImageFormat(file);
    }
}
