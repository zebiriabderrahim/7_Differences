import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameCard } from '@common/message';

@Component({
    selector: 'app-player-name-dialog-box',
    templateUrl: './player-name-dialog-box.component.html',
    styleUrls: ['./player-name-dialog-box.component.scss'],
})
export class PlayerNameDialogBoxComponent implements OnInit {
    @Output() playerNameEvent = new EventEmitter<string>();
    playerName: string = '';
    routerPlay: string = '/game/';

    playerNameForm = new FormGroup({
        name: new FormControl('', [Validators.required, Validators.pattern(/^\S*$/)]),
    });

    constructor(public dialogRef: MatDialogRef<PlayerNameDialogBoxComponent>, @Inject(MAT_DIALOG_DATA) public data: GameCard) {}
    ngOnInit(): void {
        this.routerPlay += this.data.id;
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    submitForm() {
        if (this.playerNameForm.valid && this.playerNameForm.value.name) {
            this.dialogRef.close(this.playerNameForm.value.name);
        }
    }
}
