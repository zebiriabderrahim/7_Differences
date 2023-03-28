import { GAME_HISTORY } from '@common/constants';
import { ClassicPlayRoom, GameHistory } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HistoryService {
    history: GameHistory[];
    private pendingGames: Map<string, GameHistory>;

    constructor() {
        this.history = GAME_HISTORY;
        this.pendingGames = new Map<string, GameHistory>();
    }

    createEntry(room: ClassicPlayRoom) {
        console.log('creating entry');
        const date = new Date();
        const gameHistory: GameHistory = {
            date: this.getFormattedDate(date),
            startingHour: this.getFormattedTime(date),
            duration: date.getTime(),
            gameMode: room.clientGame.mode,
            player1: {
                name: room.player1.name,
                isWinner: false,
                isQuitter: false,
            },
        };
        console.log('player1 added');
        console.log(gameHistory.player1.name);
        if (room.player2) {
            gameHistory.player2 = {
                name: room.player2.name,
                isWinner: false,
                isQuitter: false,
            };
        }
        console.log('create id');
        console.log(room.roomId)
        this.pendingGames.set(room.roomId, gameHistory);
    }

    closeEntry(roomId: string) {
        console.log('closing entry');
        console.log('room id');
        console.log(roomId);
        const gameHistory = this.pendingGames.get(roomId);
        if (!gameHistory) return;
        gameHistory.duration = new Date().getTime() - gameHistory.duration;
        this.history.push(gameHistory);
        console.log('history added');
        console.log(gameHistory);
        this.pendingGames.delete(roomId);
    }

    markPlayerAsWinner(roomId: string, playerName: string) {
        const gameHistory = this.pendingGames.get(roomId);
        if (!gameHistory) return;
        if (gameHistory.player1.name === playerName) {
            gameHistory.player1.isWinner = true;
        } else if (gameHistory.player2 && gameHistory.player2.name === playerName) {
            gameHistory.player2.isWinner = true;
        }
        this.pendingGames.set(roomId, gameHistory);
    }

    markPlayerAsQuitter(roomId: string, playerName: string) {
        const gameHistory = this.pendingGames.get(roomId);
        if (!gameHistory) return;
        if (gameHistory.player1.name === playerName) {
            gameHistory.player1.isQuitter = true;
        } else if (gameHistory.player2 && gameHistory.player2.name === playerName) {
            gameHistory.player2.isQuitter = true;
        }
        this.pendingGames.set(roomId, gameHistory);
    }

    getFormattedDate(date: Date): string {
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDay()}`;
    }

    getFormattedTime(date: Date): string {
        return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    }
}
