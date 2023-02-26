// import { Coordinate } from '@common/coordinate';
import { CanvasPosition } from '@app/enum/canvas-position';
import { CanvasAction } from '@app/enum/canvas-action';

export interface CanvasOperation {
    action: CanvasAction;
    // coordinate: Coordinate;
    position: CanvasPosition;
    color: string;
    width: number;
}
