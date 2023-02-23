import { Coordinate } from '@common/coordinate';

export interface ServerSideGame {
    id: string;
    name: string;
    original: string;
    modified: string;
    differences: Coordinate[][];
    differencesCount: number;
    isHard: boolean;
}

export interface ClientSideGame {
    id: string;
    name: string;
    player: string;
    mode: string;
    original: string;
    modified: string;
    isHard: boolean;
    differencesCount: number;
}

export interface GameCard {
    id: string;
    name: string;
    difficultyLevel: boolean;
    soloTopTime: PlayerTime[];
    oneVsOneTopTime: PlayerTime[];
    thumbnail: string;
}

export interface CarouselPaginator {
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

export interface PlayRoom {
    roomId: string;
    clientGame: ClientSideGame;
    endMessage: string;
    timer: number;
    differencesData: Differences;
    originalDifferencesCount: number;
    originalDifferences: Coordinate[][];
}

export interface Differences {
    currentDifference: Coordinate[];
    differencesFound: number;
}

export enum GameEvents {
    ValidateCoords = 'validateCoords',
    Penalty = 'penalty',
    CheckStatus = 'checkStatus',
    CreateSoloGame = 'createSoloGame',
    EndGame = 'endGame',
    TimerStarted = 'timerStarted',
    RemoveDiff = 'removeDiff',
}
