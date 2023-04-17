import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    DEFAULT_BONUS_VALUE,
    DEFAULT_COUNTDOWN_VALUE,
    DEFAULT_PENALTY_VALUE,
    MAX_BONUS_TIME,
    MAX_COUNTDOWN_TIME,
    MAX_PENALTY_TIME,
    MIN_COUNTDOWN_TIME,
    MIN_TIME,
} from '@app/constants/constants';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { GameConfigConst } from '@common/game-interfaces';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-config-dialog',
    templateUrl: './config-dialog.component.html',
    styleUrls: ['./config-dialog.component.scss'],
})
export class ConfigDialogComponent implements OnInit, OnDestroy {
    configForm: FormGroup;
    configConstants: GameConfigConst;
    communicationSubscription: Subscription;
    private isReloadNeededSubscription: Subscription;
    constructor(
        private formBuilder: FormBuilder,
        private readonly communicationService: CommunicationService,
        private readonly roomManagerService: RoomManagerService,
    ) {
        this.configConstants = { countdownTime: DEFAULT_COUNTDOWN_VALUE, penaltyTime: DEFAULT_PENALTY_VALUE, bonusTime: DEFAULT_BONUS_VALUE };
        this.configForm = this.formBuilder.group({
            countdownTime: ['', [Validators.required, Validators.min(MIN_COUNTDOWN_TIME), Validators.max(MAX_COUNTDOWN_TIME)]],
            penaltyTime: ['', [Validators.required, Validators.min(MIN_TIME), Validators.max(MAX_PENALTY_TIME)]],
            bonusTime: ['', [Validators.required, Validators.min(MIN_TIME), Validators.max(MAX_BONUS_TIME)]],
        });
        this.patchConfigForm();
    }

    ngOnInit(): void {
        this.loadGameConstants();
        this.handleChanges();
    }

    saveGameConstants() {
        this.configConstants = this.configForm.value.valueOf();
        this.communicationService.updateGameConstants(this.configConstants).subscribe(() => {
            this.roomManagerService.gameConstantsUpdated();
        });
    }

    resetConfigForm() {
        this.configForm.reset({ countdownTime: DEFAULT_COUNTDOWN_VALUE, penaltyTime: DEFAULT_PENALTY_VALUE, bonusTime: DEFAULT_BONUS_VALUE });
    }

    ngOnDestroy() {
        this.communicationSubscription?.unsubscribe();
        this.isReloadNeededSubscription?.unsubscribe();
    }

    private loadGameConstants() {
        this.communicationSubscription = this.communicationService.loadConfigConstants().subscribe((configConstants) => {
            this.configConstants = configConstants;
            this.patchConfigForm();
        });
    }

    private handleChanges() {
        this.isReloadNeededSubscription = this.roomManagerService.isReloadNeeded$.subscribe((isReloadNeeded) => {
            if (isReloadNeeded) {
                this.loadGameConstants();
            }
        });
    }

    private patchConfigForm() {
        this.configForm.patchValue({
            countdownTime: this.configConstants.countdownTime,
            penaltyTime: this.configConstants.penaltyTime,
            bonusTime: this.configConstants.bonusTime,
        });
    }
}
