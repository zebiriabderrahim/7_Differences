import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfigDialogComponent } from '@app/components/config-dialog/config-dialog.component';
import { DeleteResetConfirmationDialogComponent } from '@app/components/delete-reset-confirmation-dialog/delete-reset-confirmation-dialog.component';
import { DEFAULT_BONUS_VALUE, DEFAULT_COUNTDOWN_VALUE, DEFAULT_PENALTY_VALUE } from '@app/constants/constants';
import { Actions } from '@app/enum/delete-reset-actions';
import { GameConfigConst } from '@common/game-interfaces';

@Component({
    selector: 'app-config-page',
    templateUrl: './config-page.component.html',
    styleUrls: ['./config-page.component.scss'],
})
export class ConfigPageComponent {
    actions: typeof Actions;
    readonly createRoute: string;
    readonly homeRoute: string;
    configConstants: GameConfigConst;

    constructor(private readonly dialog: MatDialog) {
        this.configConstants = { countdownTime: DEFAULT_COUNTDOWN_VALUE, penaltyTime: DEFAULT_PENALTY_VALUE, bonusTime: DEFAULT_BONUS_VALUE };
        this.homeRoute = '/home';
        this.createRoute = '/create';
        this.actions = Actions;
    }

    openConfirmationDialog(action: Actions) {
        this.dialog.open(DeleteResetConfirmationDialogComponent, {
            data: { actions: action },
            disableClose: true,
        });
    }

    openConfigDialog() {
        this.dialog.open(ConfigDialogComponent, new MatDialogConfig()).afterClosed();
    }
}
