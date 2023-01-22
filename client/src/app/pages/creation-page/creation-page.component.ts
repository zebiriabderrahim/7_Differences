import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './creation-page.component.html',
    styleUrls: ['./creation-page.component.scss'],
})
export class CreationPageComponent {
    url: string | null | ArrayBuffer =
        // eslint-disable-next-line max-len
        'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.ytimg.com%2Fvi%2Ft6zVn5heQTY%2Fmaxresdefault.jpg&f=1&nofb=1&ipt=233d25c6f7a5c24a68c48f8ad3c8e581e531997f0dd5aa061624e99ad3e9cf2a&ipo=images';

    radiusSize0: number = 0;
    radiusSize3: number = 3;
    radiusSize9: number = 9;
    radiusSize15: number = 15;

    radiusSizes: number[] = [this.radiusSize0, this.radiusSize3, this.radiusSize9, this.radiusSize15];
    defaultRadius: number = this.radiusSize3;

    onSelect(event: Event) {
        const target = event.target as HTMLInputElement;
        const image = (target.files as FileList)[0];
        const fileType = image.type;
        if (fileType.match(/image\/*/)) {
            const reader = new FileReader();
            reader.readAsDataURL(image);
            reader.onload = (e: Event) => {
                this.url = (e.target as FileReader).result;
            };
        } else {
            window.alert('Please select correct image format');
        }
    }
}
