import { Injectable } from '@angular/core';
// import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ImageService {
    originalImage: HTMLImageElement = new Image();
    modifiedImage: HTMLImageElement = new Image();
    // resetCanvas() {
    //   console.log("reset")
    // }
}
