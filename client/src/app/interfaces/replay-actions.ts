import { ReplayActions } from '@app/enum/replay-actions';
import { Coordinate } from '@common/coordinate';
import { ChatMessage, GameRoom } from '@common/game-interfaces';

export interface ClickErrorData {
    isMainCanvas: boolean;
    pos: Coordinate;
}

export interface ReplayEvent {
    action: ReplayActions;
    timestamp: number;
    data?: Payload;
}

export type Payload = Coordinate[] | ClickErrorData | ChatMessage | string | number | GameRoom;
