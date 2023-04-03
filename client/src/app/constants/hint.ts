import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { Quadrant } from '@app/interfaces/quadrant';
import { QuadrantPosition } from '@app/enum/quadrant-position';

export const DEFAULT_N_HINTS = 3;
export const HINT_SQUARE_PADDING = 2;

export const INITIAL_QUADRANT: Quadrant = {
    bottomCorner: { x: 0, y: 0 },
    topCorner: { x: IMG_WIDTH, y: IMG_HEIGHT },
};

export const QUADRANT_POSITIONS: QuadrantPosition[] = [
    QuadrantPosition.First,
    QuadrantPosition.Second,
    QuadrantPosition.Third,
    QuadrantPosition.Fourth,
];