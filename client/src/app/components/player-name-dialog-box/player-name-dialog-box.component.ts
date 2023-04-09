import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AsyncValidatorFn, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '@app/constants/constants';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { PlayerData } from '@common/game-interfaces';
import { Subscription, filter, firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-player-name-dialog-box',
    templateUrl: './player-name-dialog-box.component.html',
    styleUrls: ['./player-name-dialog-box.component.scss'],
})
export class PlayerNameDialogBoxComponent implements OnInit, OnDestroy {
    playerNameForm: FormGroup;
    private roomAvailabilitySubscription: Subscription;

    constructor(
        private dialogRef: MatDialogRef<PlayerNameDialogBoxComponent>,
        @Inject(MAT_DIALOG_DATA) private data: { gameId: string },
        private readonly roomManagerService: RoomManagerService,
    ) {
        this.playerNameForm = new FormGroup({
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
    }
    ngOnDestroy(): void {
        this.roomAvailabilitySubscription?.unsubscribe();
    }

    ngOnInit(): void {
        if (!this.data) return;
        this.handleCreateUndoCreation(this.data.gameId);
        this.handleGameCardDelete();
    }

    submitForm() {
        if (this.playerNameForm.valid && this.playerNameForm.value.name) {
            this.dialogRef.close(this.playerNameForm.value.name);
        }
    }

    handleCreateUndoCreation(gameId: string) {
        this.roomAvailabilitySubscription = this.roomManagerService.oneVsOneRoomsAvailabilityByRoomId$
            .pipe(filter((roomAvailability) => roomAvailability.gameId === gameId && !roomAvailability.isAvailableToJoin))
            .subscribe(() => {
                this.dialogRef.close();
            });
    }

    handleGameCardDelete() {
        this.roomManagerService.deletedGameId$.subscribe((gameId) => {
            if (gameId === this.data.gameId) {
                this.dialogRef.close();
            }
        });
    }

    async validatePlayerName(control: FormControl): Promise<{ [key: string]: unknown } | null> {
        if (!this.data) return null;
        const playerPayLoad = { gameId: this.data.gameId, playerName: control.value } as PlayerData;
        this.roomManagerService.isPlayerNameIsAlreadyTaken(playerPayLoad);
        const isNameTaken = await firstValueFrom(this.roomManagerService.playerNameAvailability$, {
            defaultValue: { gameId: this.data.gameId, isNameAvailable: true },
        });
        if (isNameTaken.gameId === this.data.gameId && !isNameTaken.isNameAvailable) {
            return { nameTaken: true };
        } else {
            return null;
        }
    }
}
