import { CanvasAction } from '@app/enum/canvas-action';
import { CanvasPosition } from '@app/enum/canvas-position';

export interface CanvasOperation {
    action: CanvasAction;
    position: CanvasPosition;
    color: string;
    width: number;
}
