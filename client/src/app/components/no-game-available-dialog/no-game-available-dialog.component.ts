import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-no-game-available-dialog',
    templateUrl: './no-game-available-dialog.component.html',
    styleUrls: ['./no-game-available-dialog.component.scss'],
})
export class NoGameAvailableDialogComponent {
    constructor(public router: Router) {}

    goToHome() {
        this.router.navigate(['/']);
    }

    goToCreate() {
        this.router.navigate(['/create']);
    }
}
