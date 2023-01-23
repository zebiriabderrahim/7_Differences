import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-player-name-dialog-box',
    templateUrl: './player-name-dialog-box.component.html',
    styleUrls: ['./player-name-dialog-box.component.scss'],
})
export class PlayerNameDialogBoxComponent {
    playerName: string = '';
    ajoutForm = new FormGroup({
        controlFrequence: new FormControl('', [Validators.required, Validators.min(1), Validators.pattern('^[0-9]*$')]),
    });
    constructor(public dialogRef: MatDialogRef<PlayerNameDialogBoxComponent>) {}

    onNoClick(): void {
        this.dialogRef.close();
    }
}
