/* eslint-disable @typescript-eslint/no-magic-numbers -- needed for tests*/
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NavBarComponent } from '@app/components/nav-bar/nav-bar.component';
import { DEFAULT_BONUS_VALUE, DEFAULT_COUNTDOWN_VALUE, DEFAULT_PENALTY_VALUE } from '@app/constants/constants';
import { SelectionPageComponent } from '@app/pages/selection-page/selection-page.component';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { of } from 'rxjs';
import { ConfigPageComponent } from './config-page.component';

describe('ConfigPageComponent', () => {
    let component: ConfigPageComponent;
    let fixture: ComponentFixture<ConfigPageComponent>;
    // let communicationServiceSpy: CommunicationService;
    // let roomManagerServiceSpy: RoomManagerService;
    // let isReloadNeededSpy: BehaviorSubject<boolean>;

    beforeEach(async () => {
        // isReloadNeededSpy = new BehaviorSubject<boolean>(true);
        // eslint-disable-next-line max-len
        // communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['loadConfigConstants', 'saveConfigConstants', 'updateGameConstants']);
        // roomManagerServiceSpy = jasmine.createSpyObj('RoomManagerService', ['isReloadNeeded', 'gameConstantsUpdated', 'handleRoomEvents'], {
        //     isReloadNeeded: isReloadNeededSpy,
        // });
        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                MatGridListModule,
                MatDialogModule,
                MatExpansionModule,
                BrowserAnimationsModule,
                HttpClientTestingModule,
                MatIconModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatDialogModule,
            ],
            declarations: [ConfigPageComponent, SelectionPageComponent, NavBarComponent],
            providers: [CommunicationService, RoomManagerService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfigPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
        fixture.detectChanges();
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

        component.onSubmit();

        expect(component.configConstants.countdownTime).toBe(10);
    });

    it('should set the penaltyTime property', () => {
        const penaltyTimeControl = component.configForm.controls['penaltyTime'];
        penaltyTimeControl.setValue(5);

        component.onSubmit();

        expect(component.configConstants.penaltyTime).toBe(5);
    });

    it('should set the bonusTime property', () => {
        const bonusTimeControl = component.configForm.controls['bonusTime'];
        bonusTimeControl.setValue(2);

        component.onSubmit();

        expect(component.configConstants.bonusTime).toBe(2);
    });

    it('onSubmit should call updateGameConstants on communicationService and gameConstantsUpdated on roomManagerService', () => {
        spyOn(component['communicationService'], 'updateGameConstants').and.returnValue(of(void 0));
        spyOn(component['roomManagerService'], 'gameConstantsUpdated').and.callThrough();

        component.configConstants = { countdownTime: 10, penaltyTime: 6, bonusTime: 3 };
        component.onSubmit();

        expect(component['communicationService'].updateGameConstants).toHaveBeenCalledWith(component.configConstants);
        expect(component['roomManagerService'].gameConstantsUpdated).toHaveBeenCalled();
    });

    it('resetConfigForm should reset the config form and update the game constants', () => {
        const resetSpy = spyOn(component.configForm, 'reset');
        const updateSpy = spyOn(component['communicationService'], 'updateGameConstants').and.returnValue(of(void 0));
        const gameConstantsSpy = spyOn(component['roomManagerService'], 'gameConstantsUpdated');

        component.resetConfigForm();

        expect(resetSpy).toHaveBeenCalledWith({
            countdownTime: DEFAULT_COUNTDOWN_VALUE,
            penaltyTime: DEFAULT_PENALTY_VALUE,
            bonusTime: DEFAULT_BONUS_VALUE,
        });
        expect(updateSpy).toHaveBeenCalledWith(component.configConstants);
        expect(gameConstantsSpy).toHaveBeenCalled();
    });

    // it('should reset the form values to the default values', () => {
    //     const countdownTimeControl = component.configForm.controls['countdownTime'];
    //     countdownTimeControl.setValue(10);

    //     const penaltyTimeControl = component.configForm.controls['penaltyTime'];
    //     penaltyTimeControl.setValue(5);

    //     const bonusTimeControl = component.configForm.controls['bonusTime'];
    //     bonusTimeControl.setValue(2);

    //     component.resetConfigForm();

    //     expect(countdownTimeControl.value).toBe(DEFAULT_COUNTDOWN_VALUE);
    //     expect(penaltyTimeControl.value).toBe(DEFAULT_PENALTY_VALUE);
    //     expect(bonusTimeControl.value).toBe(DEFAULT_BONUS_VALUE);
    // });
});
