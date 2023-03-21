import { PlayerTime } from "@common/game-interfaces";

export const DEFAULT_COUNTDOWN_VALUE = 30;
export const DEFAULT_HINT_PENALTY = 5;
export const DEFAULT_BONUS_TIME = 5;

export const GAME_CARROUSEL_SIZE = 4;

export const DEFAULT_BEST_TIMES: PlayerTime[] = [
    { name: "John Doe", time: 100 },
    { name: "Jane Doe", time: 200 },
    { name: "the scream", time: 250 },
];

const KEY_SIZE = 36;
const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';