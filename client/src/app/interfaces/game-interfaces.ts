import { Coordinate } from '@app/interfaces/coordinate';

export interface GameDetails {
    id: number;
    name: string;
    originalImage: string;
    modifiedImage: string;
    nDifference: number;
    differences: Coordinate[][];
    isHard: boolean;
}

export interface Game {
    id: number;
    name: string;
    difficultyLevel: number;
    thumbnail: string;
    soloTopTime: PlayerTime[];
    oneVsOneTopTime: PlayerTime[];
    differencesCount: number;
    hintList: string[];
}

export interface GameCard {
    id: number;
    name: string;
    difficultyLevel: number;
    soloTopTime: PlayerTime[];
    oneVsOneTopTime: PlayerTime[];
    thumbnail: string;
}

export interface GameConst {
    countdownTime: number;
    penaltyTime: number;
    bonusTime: number;
}

export interface PlayerTime {
    name: string;
    time: number;
}
