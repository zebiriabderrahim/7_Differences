import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfigDialogComponent } from '@app/components/config-dialog/config-dialog.component';
import { DeleteResetConfirmationDialogComponent } from '@app/components/delete-reset-confirmation-dialog/delete-reset-confirmation-dialog.component';
import { Actions } from '@app/enum/delete-reset-actions';

@Component({
    selector: 'app-config-page',
    templateUrl: './config-page.component.html',
    styleUrls: ['./config-page.component.scss'],
})
export class ConfigPageComponent {
    actions: typeof Actions;
    readonly createRoute: string;

    constructor(private readonly dialog: MatDialog) {
        this.createRoute = '/create';
        this.actions = Actions;
    }

    openConfirmationDialog(action: Actions) {
        this.dialog.open(DeleteResetConfirmationDialogComponent, {
            data: { actions: action },
            disableClose: true,
            panelClass: 'dialog',
        });
    }

    openConfigDialog() {
        this.dialog.open(ConfigDialogComponent, new MatDialogConfig());
    }
}
