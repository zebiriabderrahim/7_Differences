import { PlayerTime } from '@common/game-interfaces';

export const DEFAULT_COUNTDOWN_VALUE = 30;
export const DEFAULT_HINT_PENALTY = 5;
export const DEFAULT_BONUS_TIME = 5;

export const GAME_CARROUSEL_SIZE = 4;

export const DEFAULT_BEST_TIMES: PlayerTime[] = [
    { name: 'John Doe', time: 100 },
    { name: 'Jane Doe', time: 200 },
    { name: 'the scream', time: 250 },
];

export const KEY_SIZE = 36;
export const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const GAME_HISTORY = [
    {
        id: '1',
        date: '2023-09-01',
        startingHour: '00:00',
        duration: 0,
        gameMode: 'classic',
        player1: {
            name: 'test1',
            isWinner: true,
            isQuitter: false,
        },
    },
    {
        id: '2',
        date: '2023-09-01',
        startingHour: '00:00',
        duration: 0,
        gameMode: 'classic',
        player1: {
            name: 'test1',
            isWinner: true,
            isQuitter: false,
        },
        player2: {
            name: 'test2',
            isWinner: false,
            isQuitter: true,
        },
    },
];
export const MAX_TIMES_INDEX = 2;
export const NOT_FOUND = -1;
