import { ReplayActions } from '@app/enum/replay-actions';

export interface ReplayEvent {
    action: ReplayActions;
    timestamp: number;
}
