/* eslint-disable @typescript-eslint/no-magic-numbers -- needed for tests*/
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DEFAULT_BONUS_VALUE, DEFAULT_COUNTDOWN_VALUE, DEFAULT_PENALTY_VALUE } from '@app/constants/constants';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { BehaviorSubject, Subscription, of } from 'rxjs';
import { ConfigDialogComponent } from './config-dialog.component';

describe('ConfigDialogComponent', () => {
    let component: ConfigDialogComponent;
    let fixture: ComponentFixture<ConfigDialogComponent>;
    let roomManagerServiceSpy: jasmine.SpyObj<RoomManagerService>;
    let isReloadNeeded: BehaviorSubject<boolean>;

    beforeEach(async () => {
        isReloadNeeded = new BehaviorSubject<boolean>(true);
        roomManagerServiceSpy = jasmine.createSpyObj('RoomManagerService', ['gameConstantsUpdated'], {
            isReloadNeeded$: isReloadNeeded,
        });
        isReloadNeeded = new BehaviorSubject<boolean>(true);
        roomManagerServiceSpy = jasmine.createSpyObj('RoomManagerService', ['gameConstantsUpdated'], {
            isReloadNeeded$: isReloadNeeded,
        });
        await TestBed.configureTestingModule({
            declarations: [ConfigDialogComponent],
            imports: [MatDialogModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, HttpClientModule, NoopAnimationsModule],
            providers: [{ provide: RoomManagerService, useValue: roomManagerServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(ConfigDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    afterEach(() => {
        component.ngOnDestroy();
    });
    afterEach(() => {
        component.ngOnDestroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load a game when this one exist', () => {
        spyOn(component['communicationService'], 'loadConfigConstants').and.returnValue(of({ countdownTime: 0, penaltyTime: 0, bonusTime: 0 }));
        component.ngOnInit();
        expect(component['communicationService'].loadConfigConstants).toHaveBeenCalled();
        expect(component.configConstants).toEqual({ countdownTime: 0, penaltyTime: 0, bonusTime: 0 });
    });

    it('should set the countdownTime property', () => {
        const countdownTimeControl = component.configForm.controls['countdownTime'];
        countdownTimeControl.setValue(10);

        component.saveGameConstants();

        expect(component.configConstants.countdownTime).toBe(10);
    });

    it('should set the penaltyTime property', () => {
        const penaltyTimeControl = component.configForm.controls['penaltyTime'];
        penaltyTimeControl.setValue(5);

        component.saveGameConstants();

        expect(component.configConstants.penaltyTime).toBe(5);
    });

    it('should set the bonusTime property', () => {
        const bonusTimeControl = component.configForm.controls['bonusTime'];
        bonusTimeControl.setValue(2);

        component.saveGameConstants();

        expect(component.configConstants.bonusTime).toBe(2);
    });

    it('onSubmit should call updateGameConstants on communicationService and gameConstantsUpdated on roomManagerService', () => {
        spyOn(component['communicationService'], 'updateGameConstants').and.returnValue(of(void 0));

        component.configConstants = { countdownTime: 10, penaltyTime: 6, bonusTime: 3 };
        component.saveGameConstants();

        expect(component['communicationService'].updateGameConstants).toHaveBeenCalledWith(component.configConstants);
        expect(component['roomManagerService'].gameConstantsUpdated).toHaveBeenCalled();
    });

    it('resetConfigForm should reset the config form and update the game constants', () => {
        const resetSpy = spyOn(component.configForm, 'reset');

        component.resetConfigForm();

        expect(resetSpy).toHaveBeenCalledWith({
            countdownTime: DEFAULT_COUNTDOWN_VALUE,
            penaltyTime: DEFAULT_PENALTY_VALUE,
            bonusTime: DEFAULT_BONUS_VALUE,
        });
    });

    it('should call loadGameConstants when handleChanges is called if Reload is needed', () => {
        const loadGameConstantsSpy = spyOn(component, 'loadGameConstants');
        component.handleChanges();
        expect(loadGameConstantsSpy).toHaveBeenCalled();
    });

    it('should unsubscribe reloadSubscription when component is destroyed', () => {
        component['communicationSubscription'] = undefined as unknown as Subscription;
        component['isReloadNeededSubscription'] = undefined as unknown as Subscription;
        component.ngOnDestroy();
        expect(component['communicationSubscription']).toBeUndefined();
        expect(component['isReloadNeededSubscription']).toBeUndefined();
    });
});
