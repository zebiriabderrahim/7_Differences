import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-player-name-dialog-box',
    templateUrl: './player-name-dialog-box.component.html',
    styleUrls: ['./player-name-dialog-box.component.scss'],
})
export class PlayerNameDialogBoxComponent {
    playerNameForm = new FormGroup({
        name: new FormControl('', [Validators.required, Validators.pattern(/^\S*$/)]),
    });

    constructor(private readonly dialogRef: MatDialogRef<PlayerNameDialogBoxComponent>) {}

    closeModal(): void {
        this.dialogRef.close();
    }

    submitForm() {
        if (this.playerNameForm.valid && this.playerNameForm.value.name) {
            this.dialogRef.close(this.playerNameForm.value.name);
        }
    }
}
