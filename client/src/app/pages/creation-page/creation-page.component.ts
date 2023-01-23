import { Component } from '@angular/core';
import { DEFAULT_RADIUS, IMG_HEIGHT, IMG_TYPE, IMG_WIDTH, RADIUS_SIZES } from '@app/constants/creation-page';

@Component({
    selector: 'app-root',
    templateUrl: './creation-page.component.html',
    styleUrls: ['./creation-page.component.scss'],
})
export class CreationPageComponent {
    url: string = '';
    isImageTypeValid: boolean = false;
    isImageSizeValid: boolean = false;
    isImageFormatValid: boolean = false;

    radiusSizes: number[] = RADIUS_SIZES;
    defaultRadius: number = DEFAULT_RADIUS;

    validateImageType(imageDescription: string) {
        this.isImageTypeValid = imageDescription.includes(IMG_TYPE);
    }

    validateImageSize(event: Event) {
        const target = event.target as HTMLInputElement;
        this.isImageSizeValid = target.width === IMG_WIDTH && target.height === IMG_HEIGHT;
    }

    async validateImageFormat(file: File) {
        const bmpHeader = new DataView(await file.arrayBuffer());
        const bmpFormat = bmpHeader.getUint16(28, true);
        this.isImageFormatValid = bmpFormat === 24;
    }

    onSelectFile(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files[0]) {
            const reader = new FileReader();
            const file = target.files[0];
            reader.readAsDataURL(target.files[0]);
            reader.onload = (e: Event) => {
                const image = new Image();
                image.src = reader.result as string;
                image.onload = (ev: Event) => {
                    this.validateImageType(image.src);
                    this.validateImageSize(ev);
                    this.validateImageFormat(file);
                };
                this.url = (e.target as FileReader).result as string;
            };
        }
    }
}
