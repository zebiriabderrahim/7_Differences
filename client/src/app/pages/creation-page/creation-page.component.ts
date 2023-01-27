import { Component } from '@angular/core';
import { DEFAULT_RADIUS, RADIUS_SIZES } from '@app/constants/creation-page';
import { ValidationService } from '@app/services/validation-service//validation.service';

@Component({
    selector: 'app-root',
    templateUrl: './creation-page.component.html',
    styleUrls: ['./creation-page.component.scss'],
})
export class CreationPageComponent {
    urls: string[] = [];
    isImageTypeValid: boolean = false;
    isImageSizeValid: boolean = false;
    isImageFormatValid: boolean = false;

    radiusSizes: number[] = RADIUS_SIZES;
    defaultRadius: number = DEFAULT_RADIUS;

    constructor(public validationService: ValidationService) {}

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
                    this.validationService.validateImage(file, ev, image.src);
                };
                this.urls.push((e.target as FileReader).result as string);
            };
        }
    }
}
