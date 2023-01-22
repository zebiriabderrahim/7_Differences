import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './creation-page.component.html',
  styleUrls: ['./creation-page.component.scss'],
})

export class CreationPageComponent {
  selectedImage: File;

  radiusSize0: number = 0;
  radiusSize3: number = 3;
  radiusSize9: number = 9;
  radiusSize15: number = 15;

  radiusSizes: number[] = [this.radiusSize0, this.radiusSize3, this.radiusSize9, this.radiusSize15];
  defaultRadius: number = this.radiusSize3;

  constructor(private http: HttpClient) {}

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    this.selectedImage = (target.files as FileList)[0];
  }

  onUpload() {
    const fd = new FormData();
    fd.append('image', this.selectedImage, this.selectedImage.name);
    this.http.post('./src/assets/img', fd).subscribe((res) => {
      // eslint-disable-next-line no-console
      console.log(res);
    });
  }
}
