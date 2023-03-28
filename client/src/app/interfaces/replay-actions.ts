import { ReplayAction } from '@app/enum/replay-actions';

export interface ReplayData {
    action: ReplayAction;
    timestamp: number;
}
