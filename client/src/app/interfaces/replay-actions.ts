import { ReplayAction } from '@app/enum/replay-actions';

export interface ReplayActionData {
    action: ReplayAction;
    timestamp: number;
}
