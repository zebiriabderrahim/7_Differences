import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { ChronometerComponent } from './chronometer.component';

describe('ChronometerComponent', () => {
    let component: ChronometerComponent;
    let fixture: ComponentFixture<ChronometerComponent>;
    let de: DebugElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [ChronometerComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ChronometerComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render temps word ', () => {
        expect(de.query(By.css('h1')).nativeElement.innerText).toBe('Temps');
    });

    it('should start and stop the timer', () => {
        component.startTimer();
        expect(component.isRunning).toBe(true);
        component.stopTimer();
        expect(component.isRunning).toBe(false);
    });
    it('timer should start at 00:00 seconds', fakeAsync(() => {
        component.startTimer();
        const oneSecond = component['oneSecond'];
        tick(oneSecond * 0);
        expect(component.time).toBe('00:00');
        component.stopTimer();
    }));

    it('timer should show the right time format mm:ss and the right time after 60 seconds', fakeAsync(() => {
        component.startTimer();
        const oneSecond = component['oneSecond'];
        const toMinutes = component['toMinutes'];
        tick(oneSecond * toMinutes * toMinutes);
        expect(component.time).toBe('60:00');
        component.stopTimer();
    }));

    afterEach(() => {
        const timerSubscription = component['timerSubscription'];
        timerSubscription.unsubscribe();
    });
});
