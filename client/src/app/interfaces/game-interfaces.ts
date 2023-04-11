import { Coordinate } from '@common/coordinate';
import { GameModes } from '@common/enums';
import { ChatMessage, ClientSideGame, PlayerTime } from '@common/game-interfaces';

export interface GameDetails {
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
    difficultyLevel: boolean;
    original: string;
    modified: string;
    soloTopTime: PlayerTime[];
    oneVsOneTopTime: PlayerTime[];
    differencesCount: number;
    thumbnail: string;
    hintList: string[];
}

export interface CanvasMeasurements {
    width: number;
    height: number;
}

export interface GamePageData {
    game: ClientSideGame;
    differencesFound: number;
    opponentDifferencesFound: number;
    messages: ChatMessage[];
    player: string;
    showThirdHintHelp: boolean;
    hintsAssets: string[];
    isReplayAvailable: boolean;
    gameMode: typeof GameModes;
}
