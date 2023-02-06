import { Injectable } from '@angular/core';
import { BMP_HEADER_OFFSET, FORMAT_IMAGE, IMG_HEIGHT, IMG_TYPE, IMG_WIDTH } from '@app/constants/creation-page';
import { Buffer } from 'buffer';
import { ImageService } from '@app/services/image-service/image.service';
@Injectable({
    providedIn: 'root',
})
export class ValidationService {
    constructor(public imageService: ImageService) {}

    areImagesSet(): boolean {
        return this.imageService.leftBackground !== '' && this.imageService.rightBackground !== '';
    }

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

    isImageValid(event: Event, imageDescription: string): boolean {
        return this.isImageTypeValid(imageDescription) && this.isImageSizeValid(event) && this.isImageFormatValid(imageDescription);
    }
}
