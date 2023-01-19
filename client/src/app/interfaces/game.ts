import { Player } from './player';

export interface Game {
    id: number;
    name: string;
    difficultyLevel: number;
    thumbnail: string;
    soloTopTime: Player[];
    oneVsOneTopTime: Player[];
}
