export interface Message {
    title: string;
    body: string;
}

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
