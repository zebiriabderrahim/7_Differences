export interface GameDetails {
    id: number;
    name: string;
    originalImagePath: string;
    modifiedImagePath: string;
    nDifference: number;
    differenceMatrix: number[][];
    isHard: boolean;
}

export interface Game {
    id: number;
    name: string;
    difficultyLevel: number;
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
export interface GameCarrousel {
    hasNext: boolean;
    hasPrevious: boolean;
    gameCards: GameCard[];
}

export interface GameConfig {
    countdownTime: number;
    penaltyTime: number;
    bonusTime: number;
}

export interface PlayerTime {
    name: string;
    time: number;
}
