import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-waiting-host-to-decide',
    templateUrl: './waiting-host-to-decide.component.html',
    styleUrls: ['./waiting-host-to-decide.component.scss'],
})
export class WaitingHostToDecideComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: { gameId: string }) {}
}
