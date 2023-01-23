import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './creation-page.component.html',
    styleUrls: ['./creation-page.component.scss'],
})
export class CreationPageComponent {
    url: string | null | ArrayBuffer = '';

    radiusSize0: number = 0;
    radiusSize3: number = 3;
    radiusSize9: number = 9;
    radiusSize15: number = 15;

    radiusSizes: number[] = [this.radiusSize0, this.radiusSize3, this.radiusSize9, this.radiusSize15];
    defaultRadius: number = this.radiusSize3;

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
