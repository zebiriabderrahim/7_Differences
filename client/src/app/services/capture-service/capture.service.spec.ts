import { TestBed } from '@angular/core/testing';

import { ReplayActions } from '@app/enum/replay-actions';
import { ReplayEvent, ReplayPayload } from '@app/interfaces/replay-actions';
import { CaptureService } from './capture.service';

describe('CaptureService', () => {
    let service: CaptureService;
    let dataStub: ReplayPayload;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CaptureService);
        dataStub = 'data';
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should emit a replay event on saveReplayEvent call', (done) => {
        const action: ReplayActions = ReplayActions.StartGame;
        const data: ReplayPayload = dataStub;

        service.replayEventsSubject$.subscribe((replayEvent: ReplayEvent) => {
            expect(replayEvent.action).toEqual(action);
            expect(replayEvent.data).toEqual(data);
            done();
        });

        service.saveReplayEvent(action, data);
    });
});
