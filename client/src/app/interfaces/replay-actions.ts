import { ReplayActions } from '@app/enum/replay-actions';
import { Coordinate } from '@common/coordinate';
import { ChatMessage } from '@common/game-interfaces';

export interface ClickErrorData {
    isMainCanvas: boolean;
    x: number;
    y: number;
}

export interface ReplayEvent {
    action: ReplayActions;
    timestamp: number;
    data?: Coordinate[] | ClickErrorData | ChatMessage | string;
}
