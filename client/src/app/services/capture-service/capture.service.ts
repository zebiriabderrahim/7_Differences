import { Injectable } from '@angular/core';
import { ReplayActions } from '@app/enum/replay-actions';
import { ReplayEvent, ReplayPayload } from '@app/interfaces/replay-actions';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CaptureService {
    private replayEventsSubject: Subject<ReplayEvent>;

    constructor() {
        this.replayEventsSubject = new Subject<ReplayEvent>();
    }

    get replayEventsSubject$() {
        return this.replayEventsSubject.asObservable();
    }

    saveReplayEvent(action: ReplayActions, data?: ReplayPayload): void {
        const replayEvent: ReplayEvent = { action, timestamp: Date.now(), data };
        this.replayEventsSubject.next(replayEvent);
    }
}
