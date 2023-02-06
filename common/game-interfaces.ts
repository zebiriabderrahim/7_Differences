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
    difficultyLevel: boolean;
    original: string;
    modified: string;
    soloTopTime: PlayerTime[];
    oneVsOneTopTime: PlayerTime[];
    differences: Coordinate[][];
    differencesCount: number;
    thumbnail: string;
    hintList: string[];
}
export interface ClientSideGame {
    id: number;
    gameName: string;
    player: string;
    gameMode: string;
    timer: number;
    differencesFound: number;
    messages: string[];
    endGameMessage: string;
    currentDifference: Coordinate[];
    hintPenalty: number;
    soloTopTime: PlayerTime[];
    oneVsOneTopTime: PlayerTime[];
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
