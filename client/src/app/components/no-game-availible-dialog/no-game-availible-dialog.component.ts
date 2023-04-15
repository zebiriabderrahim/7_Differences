import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-no-game-availible-dialog',
    templateUrl: './no-game-availible-dialog.component.html',
    styleUrls: ['./no-game-availible-dialog.component.scss'],
})
export class NoGameAvailibleDialogComponent {
    constructor(public router: Router) {}

    goToHome() {
        this.router.navigate(['/']);
    }

    goToCreate() {
        this.router.navigate(['/create']);
    }
}
