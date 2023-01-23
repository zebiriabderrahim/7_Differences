import { Component } from '@angular/core';
import { DEFAULT_RADIUS, IMG_HEIGHT, IMG_TYPE, IMG_WIDTH, RADIUS_SIZES } from '@app/constants/creation-page';

@Component({
    selector: 'app-root',
    templateUrl: './creation-page.component.html',
    styleUrls: ['./creation-page.component.scss'],
})
export class CreationPageComponent {
    url: string = '';

    radiusSizes: number[] = RADIUS_SIZES;
    defaultRadius: number = DEFAULT_RADIUS;

    isImageTypeValid(imageDescription: string) {
        return imageDescription === IMG_TYPE;
    }

    isImageSizeValid(event: Event) {
        const target = event.target as HTMLInputElement;
        return target.width === IMG_WIDTH && target.height === IMG_HEIGHT;
    }

    onSelectFile(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files[0]) {
            const reader = new FileReader();
            reader.readAsDataURL(target.files[0]);
            reader.onload = (e: Event) => {
                this.url = (e.target as FileReader).result as string;
            };
        }
    }
}
