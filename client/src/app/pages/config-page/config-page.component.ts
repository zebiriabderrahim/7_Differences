import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfigDialogComponent } from '@app/components/config-dialog/config-dialog.component';
import {
    DEFAULT_BONUS_VALUE,
    DEFAULT_COUNTDOWN_VALUE,
    DEFAULT_PENALTY_VALUE,
    MAX_BONUS_TIME,
    MAX_COUNTDOWN_TIME,
    MAX_PENALTY_TIME,
    MIN_TIME,
} from '@app/constants/constants';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { GameConfigConst } from '@common/game-interfaces';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-config-page',
    templateUrl: './config-page.component.html',
    styleUrls: ['./config-page.component.scss'],
})
export class ConfigPageComponent implements OnInit, OnDestroy {
    configForm: FormGroup;
    readonly createRoute: string;
    readonly homeRoute: string;
    configConstants: GameConfigConst;
    private communicationSubscription: Subscription;
    private isReloadNeededSubscription: Subscription;

    constructor(
        private readonly communicationService: CommunicationService,
        private readonly roomManagerService: RoomManagerService,
        private formBuilder: FormBuilder,
        private readonly matDialog: MatDialog,
    ) {
        this.configConstants = { countdownTime: DEFAULT_COUNTDOWN_VALUE, penaltyTime: DEFAULT_PENALTY_VALUE, bonusTime: DEFAULT_BONUS_VALUE };
        this.homeRoute = '/home';
        this.createRoute = '/create';
        this.configForm = this.formBuilder.group({
            countdownTime: ['', [Validators.required, Validators.min(MIN_TIME), Validators.max(MAX_COUNTDOWN_TIME)]],
            penaltyTime: ['', [Validators.required, Validators.min(MIN_TIME), Validators.max(MAX_PENALTY_TIME)]],
            bonusTime: ['', [Validators.required, Validators.min(MIN_TIME), Validators.max(MAX_BONUS_TIME)]],
        });
        this.patchConfigForm();
    }

    ngOnInit() {
        this.loadGameConstants();
        this.handleChanges();
    }

    onSubmit() {
        this.configConstants = this.configForm.value.valueOf();
        this.communicationService.updateGameConstants(this.configConstants).subscribe(() => {
            this.roomManagerService.gameConstantsUpdated();
        });
    }

    resetConfigForm() {
        this.configForm.reset({ countdownTime: DEFAULT_COUNTDOWN_VALUE, penaltyTime: DEFAULT_PENALTY_VALUE, bonusTime: DEFAULT_BONUS_VALUE });
        this.communicationSubscription = this.communicationService.updateGameConstants(this.configConstants).subscribe(() => {
            this.roomManagerService.gameConstantsUpdated();
        });
    }

    resetAllTopTimes() {
        this.roomManagerService.resetAllTopTimes();
    }

    loadGameConstants() {
        this.communicationSubscription = this.communicationService.loadConfigConstants().subscribe((configConstants) => {
            this.configConstants = configConstants;
            this.patchConfigForm();
        });
    }

    handleChanges() {
        this.isReloadNeededSubscription = this.roomManagerService.isReloadNeeded$.subscribe((isReloadNeeded) => {
            if (isReloadNeeded) {
                this.loadGameConstants();
            }
        });
    }

    patchConfigForm() {
        this.configForm.patchValue({
            countdownTime: this.configConstants.countdownTime,
            penaltyTime: this.configConstants.penaltyTime,
            bonusTime: this.configConstants.bonusTime,
        });
    }

    openDialog() {
        this.matDialog.open(ConfigDialogComponent, {
            panelClass: 'background-image',
        });
    }

    ngOnDestroy() {
        this.communicationSubscription?.unsubscribe();
        this.isReloadNeededSubscription?.unsubscribe();
    }
}
