import { Component, ElementRef, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/creation-page';
import { CreationPageComponent } from '@app/pages/creation-page/creation-page.component';
import { DifferenceService } from '@app/services/difference-service/difference.service';
import { ImageService } from '@app/services/image-service/image.service';

@Component({
    selector: 'app-creation-game-dialog',
    templateUrl: './creation-game-dialog.component.html',
    styleUrls: ['./creation-game-dialog.component.scss'],
})
export class CreationGameDialogComponent implements OnInit {
    @Output() gameNameEvent = new EventEmitter<string>();
    @ViewChild('differenceCanvas', { static: true }) differenceCanvas: ElementRef;
    gameName: string = '';
    routerConfig: string = '/config/';
    gameNameForm = new FormGroup({
        name: new FormControl('', [Validators.required, Validators.pattern(/^\S*$/)]),
    });
    // Services are needed for the dialog and dialog needs to talk to the parent component
    // eslint-disable-next-line max-params
    constructor(
        public imageService: ImageService,
        private differenceService: DifferenceService,
        public dialogRef: MatDialogRef<CreationPageComponent>,
        @Inject(MAT_DIALOG_DATA) public radius: number,
    ) {}

    get displayDifferences(): number {
        return this.differenceService.differencePackages.length;
    }

    ngOnInit(): void {
        this.differenceCanvas.nativeElement.width = IMG_WIDTH;
        this.differenceCanvas.nativeElement.height = IMG_HEIGHT;
        const differenceContext = this.differenceCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.imageService.setDifferenceContext(differenceContext, this.radius);
    }

    isNumberOfDifferencesValid(): boolean {
        return this.differenceService.isNumberOfDifferencesValid();
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    submitForm() {
        if (this.gameNameForm.valid && this.gameNameForm.value.name) {
            this.gameNameEvent.emit(this.gameNameForm.value.name);
            this.dialogRef.close();
            this.imageService.createGame(this.gameNameForm.value.name);
        }
    }
}
