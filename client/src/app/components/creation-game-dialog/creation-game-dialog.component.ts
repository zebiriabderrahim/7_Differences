import { Component, ElementRef, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GAME_ID_MAX } from '@app/constants/constants';
import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/creation-page';
import { Coordinate } from '@app/interfaces/coordinate';
import { ImageSources } from '@app/interfaces/image-sources';
// import { GamePixels } from '@app/interfaces/pixel';
import { CreationPageComponent } from '@app/pages/creation-page/creation-page.component';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { DifferenceService } from '@app/services/difference-service/difference.service';
import { ImageService } from '@app/services/image-service/image.service';
import { GameDetails } from '@app/interfaces/game-interfaces';

@Component({
    selector: 'app-creation-game-dialog',
    templateUrl: './creation-game-dialog.component.html',
    styleUrls: ['./creation-game-dialog.component.scss'],
})
export class CreationGameDialogComponent implements OnInit {
    @Output() gameNameEvent = new EventEmitter<string>();
    @ViewChild('differenceCanvas', { static: true }) differenceCanvas: ElementRef;
    gameName: string;
    readonly routerConfig: string = '/config/';
    gameNameForm = new FormGroup({
        name: new FormControl('', [Validators.required, Validators.pattern(/^\S*$/)]),
    });
    // Services are needed for the dialog and dialog needs to talk to the parent component
    // eslint-disable-next-line max-params
    constructor(
        public imageService: ImageService,
        private differenceService: DifferenceService,
        public communicationService: CommunicationService,
        public dialogRef: MatDialogRef<CreationPageComponent>,
        @Inject(MAT_DIALOG_DATA) public radius: number,
    ) {}

    get displayDifferences(): number {
        return this.differenceService.differencePackages.length;
    }

    ngOnInit(): void {
        this.gameName = '';
        this.differenceCanvas.nativeElement.width = IMG_WIDTH;
        this.differenceCanvas.nativeElement.height = IMG_HEIGHT;
        const differenceContext = this.differenceCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.imageService.setDifferenceContext(differenceContext);
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
            this.imageService.resetBothBackgrounds();
            const differences: Coordinate[][] = this.differenceService.generateDifferencesPackages();
            const imageSources: ImageSources = this.imageService.getImageSources();
            const gameDetails: GameDetails = {
                id: Math.floor(Math.random() * GAME_ID_MAX),
                name: this.gameNameForm.value.name,
                originalImage: imageSources.left,
                modifiedImage: imageSources.right,
                nDifference: differences.length,
                differences,
                isHard: this.differenceService.isGameHard(),
            };
            this.communicationService.postGame(gameDetails).subscribe();
        }
    }
}
