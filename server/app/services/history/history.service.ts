import { GameService } from '@app/services/game/game.service';
import { PADDING_N_DIGITS } from '@common/constants';
import { HistoryEvents, PlayerStatus } from '@common/enums';
import { GameHistory, GameRoom } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import * as io from 'socket.io';

@Injectable()
export class HistoryService {
    private pendingGames: Map<string, GameHistory>;

    constructor(private readonly gameService: GameService) {
        this.pendingGames = new Map<string, GameHistory>();
    }

    createEntry(room: GameRoom) {
        if (this.pendingGames.has(room.roomId)) return;
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

    async closeEntry(roomId: string, server: io.Server) {
        const gameHistory = this.pendingGames.get(roomId);
        if (!gameHistory) return;
        gameHistory.duration = new Date().getTime() - gameHistory.duration;
        this.pendingGames.delete(roomId);
        await this.gameService.saveGameHistory(gameHistory);
        server.emit(HistoryEvents.RequestReload);
    }

    markPlayer(roomId: string, playerName: string, status: PlayerStatus) {
        const gameHistory = this.pendingGames.get(roomId);
        if (!gameHistory) return;
        const playerInfoToChange = gameHistory.player2 && gameHistory.player2.name === playerName ? gameHistory.player2 : gameHistory.player1;
        switch (status) {
            case PlayerStatus.Winner:
                playerInfoToChange.isWinner = true;
                break;
            case PlayerStatus.Quitter:
                playerInfoToChange.isQuitter = true;
                break;
        }
        this.pendingGames.set(roomId, gameHistory);
    }

    private getFormattedDate(date: Date): string {
        const month = this.padValue(date.getMonth() + 1);
        const day = this.padValue(date.getDate());
        const year = date.getFullYear();

        return `${year}-${month}-${day}`;
    }

    private getFormattedTime(date: Date): string {
        const hours = this.padValue(date.getHours());
        const minutes = this.padValue(date.getMinutes());
        const seconds = this.padValue(date.getSeconds());

        return `${hours}:${minutes}:${seconds}`;
    }

    private padValue(value: number): string {
        return value.toString().padStart(PADDING_N_DIGITS, '0');
    }
}
