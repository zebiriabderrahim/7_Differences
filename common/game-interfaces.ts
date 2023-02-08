import { Coordinate } from '@common/coordinate';

export interface GameDetails {
    id: number;
    name: string;
    originalImage: string;
    modifiedImage: string;
    nDifference: number;
    differences: Coordinate[][];
    isHard: boolean;
}

export interface ServerSideGame {
    id: number;
    name: string;
    original: string;
    modified: string;
    soloTopTime: PlayerTime[];
    oneVsOneTopTime : PlayerTime[];
    differences: Coordinate[][];
    differencesCount: number;
    thumbnail: string;
    isHard: boolean;
}

export interface ClientSideGame {
    id: number;
    name: string;
    player: string;
    mode: string;
    timer: number;
    original: string;
    modified: string;
    differencesFound: number;
    endMessage: string;
    currentDifference: Coordinate[];
    differencesCount: number;
    isHard: boolean;
}

export interface GameCard {
    id: number;
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
    serverGame: ServerSideGame;
    clientGame: ClientSideGame;
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
