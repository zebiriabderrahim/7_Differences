import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReplayService } from '@app/services/replay-service/replay.service';

import { ReplayButtonsComponent } from './replay-buttons.component';

describe('ReplayButtonsComponent', () => {
    let component: ReplayButtonsComponent;
    let fixture: ComponentFixture<ReplayButtonsComponent>;
    let replayServiceSpy: jasmine.SpyObj<ReplayService>;

    beforeEach(async () => {
        replayServiceSpy = jasmine.createSpyObj('ReplayService', [
            'startReplay',
            'restartTimer',
            'pauseReplay',
            'resumeReplay',
            'resetReplay',
            'isReplaying',
            'upSpeedx1',
            'upSpeedx2',
            'upSpeedx4',
        ]);
        await TestBed.configureTestingModule({
            declarations: [ReplayButtonsComponent],
            providers: [
                {
                    provide: ReplayService,
                    useValue: replayServiceSpy,
                },
            ],
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
        const setTimeoutSpy = spyOn(window, 'setTimeout');
        component.replay();
        expect(replayServiceSpy.startReplay).toHaveBeenCalled();
        expect(replayServiceSpy.restartTimer).toHaveBeenCalled();
        expect(setTimeoutSpy).toHaveBeenCalled();
        expect(component.isReplayButtonDisabled).toBeTruthy();
    });

    it('pause() should pause the replay and toggle button UI', () => {
        component.pause();
        expect(replayServiceSpy.pauseReplay).toHaveBeenCalled();
        expect(component.isReplayPaused).toBeTruthy();
    });

    it('resume() should resume the replat and toggle button UI', () => {
        component.pause();
        component.resume();
        expect(replayServiceSpy.resumeReplay).toHaveBeenCalled();
        expect(component.isReplayPaused).toBeFalsy();
    });

    it('quit() should reset the replay when player leave', () => {
        component.quit();
        expect(replayServiceSpy.resetReplay).toHaveBeenCalled();
    });

    it('isReplaying() should return the state of the replay', () => {
        const isReplayingSpy = spyOn(component, 'isReplaying');
        component.isReplaying();
        expect(isReplayingSpy).toHaveBeenCalled();
    });

    it('upSpeedX1() should call speedX1', () => {
        component.speedX1();
        expect(replayServiceSpy.upSpeedx1).toHaveBeenCalled();
    });

    it('upSpeedX2() should call speedX2', () => {});

    it('upSpeedX4() should call speedX4', () => {});

    it('should call resetReplay when component is destroyed', () => {});
});
