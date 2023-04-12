import { GAME_HISTORY } from '@common/constants';
import { HistoryEvents } from '@common/enums';
import { GameHistory, GameRoom } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import * as io from 'socket.io';

@Injectable()
export class HistoryService {
    private history: GameHistory[];
    private pendingGames: Map<string, GameHistory>;

    constructor() {
        this.history = GAME_HISTORY;
        this.pendingGames = new Map<string, GameHistory>();
    }

    getHistory(): GameHistory[] {
        return this.history;
    }

    createEntry(room: GameRoom) {
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
        if (room.player2) {
            gameHistory.player2 = {
                name: room.player2.name,
                isWinner: false,
                isQuitter: false,
            };
        }
        this.pendingGames.set(room.roomId, gameHistory);
    }

    closeEntry(roomId: string, server: io.Server) {
        const gameHistory = this.pendingGames.get(roomId);
        if (!gameHistory) return;
        gameHistory.duration = new Date().getTime() - gameHistory.duration;
        this.history.push(gameHistory);
        this.pendingGames.delete(roomId);
        server.emit(HistoryEvents.EntryAdded, this.history);
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
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();

        return `${year}-${month}-${day}`;
    }

    getFormattedTime(date: Date): string {
        return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    }
}
