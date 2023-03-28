import { Action } from '@app/enum/replay-actions';

export interface ReplayAction {
    action: Action;
    timestamp: number;
}
