import { Component } from '@angular/core';
import { RADIUS_SIZES, DEFAULT_RADIUS } from '@app/constants/creation-page';

@Component({
    selector: 'app-root',
    templateUrl: './creation-page.component.html',
    styleUrls: ['./creation-page.component.scss'],
})
export class CreationPageComponent {
    url: string | null | ArrayBuffer = '';

    radiusSizes: number[] = RADIUS_SIZES;
    defaultRadius: number = DEFAULT_RADIUS;

    onSelectFile(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files[0]) {
            const reader = new FileReader();
            reader.readAsDataURL(target.files[0]);
            reader.onload = (e: Event) => {
                this.url = (e.target as FileReader).result;
            };
        }
    }
}
