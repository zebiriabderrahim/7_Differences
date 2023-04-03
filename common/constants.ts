import { PlayerTime } from "@common/game-interfaces";

export const DEFAULT_COUNTDOWN_VALUE = 30;
export const DEFAULT_HINT_PENALTY = 5;
export const DEFAULT_BONUS_TIME = 5;
export const MAX_BONUS_TIME_ALLOWED= 120;

export const GAME_CARROUSEL_SIZE = 4;

export const DEFAULT_BEST_TIMES: PlayerTime[] = [
    { name: "John Doe", time: 100 },
    { name: "Jane Doe", time: 200 },
    { name: "the scream", time: 250 },
];

export const KEY_SIZE = 36;
export const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const MAX_TIMES_INDEX = 2;
export const NOT_FOUND = -1;