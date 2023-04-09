import { Coordinate } from '@common/coordinate';
import { GameModes, MessageTag } from '@common/enums';

export interface Players {
    player1: Player;
    player2?: Player;
}

export interface ClientSideGame {
    id: string;
    name: string;
    mode: string;
    original: string;
    modified: string;
    isHard: boolean;
    differencesCount: number;
}

export interface GameCard {
    _id: string;
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

export interface GameRoom {
    roomId: string;
    clientGame: ClientSideGame;
    endMessage: string;
    timer: number;
    originalDifferences: Coordinate[][];
    gameConstants: GameConfigConst;
    player2?: Player;
    player1: Player;
}

export interface Player {
    playerId?: string;
    name: string;
    diffData: Differences;
}

export interface PlayerData {
    playerName: string;
    gameId: string;
    gameMode: GameModes;
}

export interface Differences {
    currentDifference: Coordinate[];
    differencesFound: number;
}

export interface RoomAvailability {
    gameId: string;
    isAvailableToJoin: boolean;
    hostId: string;
}

export interface PlayerNameAvailability {
    gameId: string;
    isNameAvailable: boolean;
}

export interface AcceptedPlayer {
    gameId: string;
    roomId: string;
    playerName: string;
}

export interface WaitingPlayerNameList {
    gameId: string;
    playerNamesList: string[];
}

export interface ChatMessage {
    tag: MessageTag;
    message: string;
}

export interface NewRecord {
    gameName: string;
    playerName: string;
    rank: number;
    gameMode: string;
}

export enum GameCardActions {
    Create = 'create',
    Join = 'join',
}
export { Coordinate };
