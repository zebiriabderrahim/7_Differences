import { Coordinate } from '@common/coordinate';

export interface GameDetails {
    name: string;
    originalImage: string;
    modifiedImage: string;
    nDifference: number;
    differences: Coordinate[][];
    isHard: boolean;
}

export interface CanvasMeasurements {
    width: number;
    height: number;
}
