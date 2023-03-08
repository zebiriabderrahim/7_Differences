import { Component, Inject } from '@angular/core';
import { AsyncValidatorFn, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '@app/constants/constants';
import { ClassicSystemService } from '@app/services/classic-system-service/classic-system.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-player-name-dialog-box',
    templateUrl: './player-name-dialog-box.component.html',
    styleUrls: ['./player-name-dialog-box.component.scss'],
})
export class PlayerNameDialogBoxComponent {
    playerNameForm = new FormGroup({
        name: new FormControl('', {
            validators: [
                Validators.required,
                Validators.pattern(/^\S*$/),
                Validators.maxLength(MAX_NAME_LENGTH),
                Validators.minLength(MIN_NAME_LENGTH),
            ],
            asyncValidators: [this.validatePlayerName.bind(this) as AsyncValidatorFn],
            updateOn: 'blur',
        }),
    });

    constructor(
        public dialogRef: MatDialogRef<PlayerNameDialogBoxComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { gameId: string },
        private readonly classicSystemService: ClassicSystemService,
    ) {
        this.classicSystemService.manageSocket();
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    submitForm() {
        if (this.playerNameForm.valid && this.playerNameForm.value.name) {
            this.dialogRef.close(this.playerNameForm.value.name);
        }
    }

    async validatePlayerName(control: FormControl): Promise<{ [key: string]: unknown } | null> {
        this.classicSystemService.isPlayerNameIsAlreadyTaken(this.data.gameId, control.value);
        const isNameTaken = await firstValueFrom(this.classicSystemService.isNameTaken$, {
            defaultValue: { gameId: this.data.gameId, isNameAvailable: true },
        });
        if (isNameTaken.gameId === this.data.gameId && !isNameTaken.isNameAvailable) {
            return { nameTaken: true };
        } else {
            return null;
        }
    }
}
