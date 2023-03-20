import { Component, Inject, OnInit } from '@angular/core';
import { AsyncValidatorFn, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '@app/constants/constants';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { filter, firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-player-name-dialog-box',
    templateUrl: './player-name-dialog-box.component.html',
    styleUrls: ['./player-name-dialog-box.component.scss'],
})
export class PlayerNameDialogBoxComponent implements OnInit {
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
        private dialogRef: MatDialogRef<PlayerNameDialogBoxComponent>,
        @Inject(MAT_DIALOG_DATA) private data: { gameId: string },
        private readonly roomManagerService: RoomManagerService,
    ) {}
    ngOnInit(): void {
        this.handelCreateUndoCreation(this.data.gameId);
    }

    submitForm() {
        if (this.playerNameForm.valid && this.playerNameForm.value.name) {
            this.dialogRef.close(this.playerNameForm.value.name);
        }
    }

    handelCreateUndoCreation(gameId: string) {
        this.roomManagerService.gameIdOfRoomToBeDeleted$.pipe(filter((id) => id === gameId)).subscribe(() => {
            this.dialogRef.close();
        });
    }

    async validatePlayerName(control: FormControl): Promise<{ [key: string]: unknown } | null> {
        this.roomManagerService.isPlayerNameIsAlreadyTaken(this.data.gameId, control.value);
        const isNameTaken = await firstValueFrom(this.roomManagerService.isNameTaken$, {
            defaultValue: { gameId: this.data.gameId, isNameAvailable: true },
        });
        if (isNameTaken.gameId === this.data.gameId && !isNameTaken.isNameAvailable) {
            return { nameTaken: true };
        } else {
            return null;
        }
    }
}
