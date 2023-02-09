import { Injectable } from '@angular/core';
import { BMP_HEADER_OFFSET, FORMAT_IMAGE, IMG_HEIGHT, IMG_TYPE, IMG_WIDTH } from '@app/constants/creation-page';
import { Buffer } from 'buffer';

@Injectable({
    providedIn: 'root',
})
export class ValidationService {
    isImageTypeValid(imageDescription: string): boolean {
        return imageDescription.includes(IMG_TYPE);
    }

    isImageSizeValid(event: Event): boolean {
        const target = event.target as HTMLInputElement;
        return target.width === IMG_WIDTH && target.height === IMG_HEIGHT;
    }

    isImageFormatValid(imageDescription: string): boolean {
        const imageData = imageDescription.split(',')[1];
        const descriptionBuffer = Uint8Array.from(Buffer.from(imageData, 'base64'));
        return descriptionBuffer[BMP_HEADER_OFFSET] === FORMAT_IMAGE;
    }
}
