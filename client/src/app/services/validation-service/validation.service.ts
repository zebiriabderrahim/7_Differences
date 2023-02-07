import { Injectable } from '@angular/core';
import { BMP_HEADER_OFFSET, FORMAT_IMAGE, IMG_HEIGHT, IMG_TYPE, IMG_WIDTH } from '@app/constants/creation-page';
import { Buffer } from 'buffer';
@Injectable({
    providedIn: 'root',
})
export class ValidationService {
    image: string = '';

    async getImageSource(file: File): Promise<string> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const image = new Image();
                image.src = reader.result as string;
                this.image = image.src;
                resolve(image.src);
            };
        });
    }

    isImageTypeValid(file: File): boolean {
        return file.type === IMG_TYPE;
    }

    isImageSizeValid(image: ImageBitmap): boolean {
        return image.width === IMG_WIDTH && image.height === IMG_HEIGHT;
    }

    isImageFormatValid(imageDescription: string): boolean {
        const imageData = imageDescription.split(',')[1];
        const descriptionBuffer = Uint8Array.from(Buffer.from(imageData, 'base64'));
        return descriptionBuffer[BMP_HEADER_OFFSET] === FORMAT_IMAGE;
    }

    async isImageUploadValid(event: Event): Promise<boolean> {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files[0] && this.isImageTypeValid(target.files[0])) {
            const file: File = target.files[0];
            const image = await createImageBitmap(file);
            const imagesSource = await this.getImageSource(file);
            return this.isImageSizeValid(image) && this.isImageFormatValid(imagesSource);
        } else {
            return false;
        }
    }
}
