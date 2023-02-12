import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MINUTE_CONVERSION, ONE_SECOND, START_TIME } from '@common/constants';
import { TimerService } from './timer.service';

describe('TimerService', () => {
    let service: TimerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TimerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should start and stop the timer', () => {
        service.startTimer();
        expect(service.isRunning).toBeTruthy();
        service.stopTimer();
        expect(service.isRunning).toBeFalsy();
    });
    it('timer should start at 00:00 seconds', fakeAsync(() => {
        service.startTimer();
        tick(START_TIME);
        expect(service.time).toBe('00:00');
        service.stopTimer();
    }));

    it('timer should show the right time format mm:ss and the right time after 60 seconds', fakeAsync(() => {
        service.startTimer();
        tick(MINUTE_CONVERSION * ONE_SECOND);
        expect(service.time).toBe('01:00');
        service.stopTimer();
    }));

    afterEach(() => {
        jasmine.clock().uninstall();
    });
});
