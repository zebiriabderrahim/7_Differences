import { GameService } from '@app/services/game/game.service';
import { RoomsManagerService } from '@app/services/rooms-manager/rooms-manager.service';
import { NOT_FOUND } from '@common/constants';
import { GameModes, RoomEvents } from '@common/enums';
import { playerData } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import * as io from 'socket.io';

@Injectable()
export class LimitedModeService {
    private availableGameByClientId: Map<string, string[]>;
    constructor(private readonly roomsManagerService: RoomsManagerService, private readonly gameService: GameService) {
        this.availableGameByClientId = new Map<string, string[]>();
    }

    async createSoloLimitedRoom(socket: io.Socket, playerName: string, server: io.Server): Promise<void> {
        await this.getAllGameIdsFromDb(socket.id);
        const randomIndex = this.generateRandomIndex(this.getGameIds(socket.id).length);
        const randomGameId = this.getGameIds(socket.id)[randomIndex];
        const limitedRoom = await this.roomsManagerService.createRoom(playerName, randomGameId);
        if (limitedRoom) {
            limitedRoom.clientGame.mode = GameModes.LimitedSolo;
            limitedRoom.player1.playerId = socket.id;
            limitedRoom.timer = limitedRoom.gameConstants.countdownTime;
            this.roomsManagerService.updateRoom(limitedRoom);
            server.to(socket.id).emit(RoomEvents.RoomLimitedCreated, limitedRoom.roomId);
        }
    }

    async createOneVsOneLimitedRoom(socket: io.Socket, playerPayLoad: playerData, server: io.Server) {
        const oneVsOneRoom = await this.roomsManagerService.createRoom(playerPayLoad.playerName, playerPayLoad.gameId);
        if (oneVsOneRoom) {
            oneVsOneRoom.clientGame.mode = GameModes.LimitedCoop;
            oneVsOneRoom.player1.playerId = socket.id;
            this.roomsManagerService.updateRoom(oneVsOneRoom);
            server.to(socket.id).emit(RoomEvents.RoomOneVsOneCreated, oneVsOneRoom.roomId);
        }
    }

    async startNextGame(socket: io.Socket, server: io.Server): Promise<void> {
        const previousRoomId = this.roomsManagerService.getRoomById(this.roomsManagerService.getRoomIdFromSocket(socket)).roomId;
        const randomIndex = this.generateRandomIndex(this.getGameIds(socket.id).length);
        const randomGameId = this.getGameIds(socket.id)[randomIndex];
        if (randomIndex === 0) return;
        this.roomsManagerService.changeGameOfRoom(previousRoomId, randomGameId);
        this.roomsManagerService.startGame(socket, server);
        this.deletePlayedGameId(socket.id, randomGameId);
    }

    deletePlayedGameId(roomId: string, gameId: string): void {
        const gameIds = this.availableGameByClientId.get(roomId);
        const index = gameIds.indexOf(gameId);
        if (index !== NOT_FOUND) {
            gameIds.splice(index, 1);
        }
    }

    handleDeleteGame(gameId: string): void {
        for (const gameIds of this.availableGameByClientId.values()) {
            const index = gameIds.indexOf(gameId);
            if (index !== NOT_FOUND) {
                gameIds.splice(index, 1);
            }
        }
    }

    handleDeleteAllGame(): void {
        this.availableGameByClientId.clear();
    }
    getGameIds(socketId: string): string[] {
        return this.availableGameByClientId.get(socketId);
    }

    private async getAllGameIdsFromDb(socketId: string): Promise<void> {
        const gameIds = await this.gameService.getAllGameIds();
        this.availableGameByClientId.set(socketId, gameIds);
    }

    private generateRandomIndex(max: number): number {
        return Math.floor(Math.random() * max);
    }
}
