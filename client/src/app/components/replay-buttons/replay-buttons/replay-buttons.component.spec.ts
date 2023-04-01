import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReplayService } from '@app/services/replay-service/replay.service';

import { ReplayButtonsComponent } from './replay-buttons.component';

describe('ReplayButtonsComponent', () => {
    let component: ReplayButtonsComponent;
    let fixture: ComponentFixture<ReplayButtonsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ReplayButtonsComponent],
            providers: [ReplayService],
        }).compileComponents();

        fixture = TestBed.createComponent(ReplayButtonsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should select speed to "x1" on creation of component', () => {
        const onInitSpy = spyOn(component, 'ngOnInit');
        component.ngOnInit();
        expect(onInitSpy).toHaveBeenCalled();
        expect(component.selectedSpeed).toEqual('x1');
    });

    it('replay() should start the replay and disable the button for one second', () => {
    });

    it('pause() should pause the replay and toggle button UI', () => {
    });

    it('resume() should resume the replat and toggle button UI', () => {
    });

    it('quit() should reset the replay when player leave', () => {
    });

    it('isReplaying() should return the state of the replay', () => {
    });

    it('upSpeedX1() should call speedX1', () => {
    });

    it('replay() should ', () => {
    });
});
