import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
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
import { of } from 'rxjs';
import { ConfigPageComponent } from './config-page.component';

describe('ConfigPageComponent', () => {
    let component: ConfigPageComponent;
    let fixture: ComponentFixture<ConfigPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                MatGridListModule,
                MatExpansionModule,
                BrowserAnimationsModule,
                HttpClientTestingModule,
                MatIconModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
            ],
            declarations: [ConfigPageComponent, SelectionPageComponent, NavBarComponent],
            providers: [CommunicationService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfigPageComponent);
        component = fixture.componentInstance;
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

    it('should reset the form values to the default values', () => {
        const countdownTimeControl = component.configForm.controls['countdownTime'];
        countdownTimeControl.setValue(10);

        const penaltyTimeControl = component.configForm.controls['penaltyTime'];
        penaltyTimeControl.setValue(5);

        const bonusTimeControl = component.configForm.controls['bonusTime'];
        bonusTimeControl.setValue(2);

        component.onSubmit();

        expect(countdownTimeControl.value).toBe(DEFAULT_COUNTDOWN_VALUE);
        expect(penaltyTimeControl.value).toBe(DEFAULT_PENALTY_VALUE);
        expect(bonusTimeControl.value).toBe(DEFAULT_BONUS_VALUE);
    });
});
