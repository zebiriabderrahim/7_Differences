import { IMG_HEIGHT, IMG_WIDTH } from '@app/constants/image';
import { QuadrantPosition } from '@app/enum/quadrant-position';
import { Quadrant } from '@app/interfaces/quadrant';

export const DEFAULT_N_HINTS = 3;
export const HINT_SQUARE_PADDING = 6;
export const SMALL_HINT_ENLARGEMENT = 20;
export const LARGE_HINT_ENLARGEMENT = 50;

export const INITIAL_QUADRANT: Quadrant = {
    bottomCorner: { x: 0, y: 0 },
    topCorner: { x: IMG_WIDTH, y: IMG_HEIGHT },
};

export const ASSETS_HINTS = [
    './assets/hintsImage/happyRaccoon.gif',
    './assets/hintsImage/confuseRaccoon.gif',
    './assets/hintsImage/passiveRaccoon.gif',
    './assets/hintsImage/sadRaccoon.gif',
];

export const QUADRANT_POSITIONS: QuadrantPosition[] = [
    QuadrantPosition.First,
    QuadrantPosition.Second,
    QuadrantPosition.Third,
    QuadrantPosition.Fourth,
];
