import { Vec2 } from './vec2';

export interface GameDetails {
    id: number;
    name: string;
    originalImagePath: string;
    modifiedImagePath: string;
    nDifference: number;
    differenceMatrix: Vec2[][];
    isHard: boolean;
}

export interface Game {
    id: number;
    name: string;
    difficultyLevel: boolean;
    original: string;
    modified: string;
    soloTopTime: PlayerTime[];
    oneVsOneTopTime: PlayerTime[];
    differencesCount: number;
    thumbnail: string;
    hintList: string[];
}

export interface GameCard {
    id: number;
    name: string;
    difficultyLevel: boolean;
    soloTopTime: PlayerTime[];
    oneVsOneTopTime: PlayerTime[];
    thumbnail: string;
}

export interface CarrouselPaginator {
    hasNext: boolean;
    hasPrevious: boolean;
    gameCards: GameCard[];
}

export interface GameConfigConst {
    countdownTime: number;
    penaltyTime: number;
    bonusTime: number;
}

export interface PlayerTime {
    name: string;
    time: number;
}
