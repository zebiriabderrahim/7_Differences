import { ReplayAction } from '@app/enum/replay-actions';

export interface ReplayEvent {
    action: ReplayAction;
    timestamp: number;
}
