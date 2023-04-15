import { RoomsManagerService } from '@app/services/rooms-manager/rooms-manager.service';
import { NOT_FOUND } from '@common/constants';
import { GameEvents, RoomEvents, GameModes } from '@common/enums';
import { GameRoom, PlayerData } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import * as io from 'socket.io';
import { HistoryService } from '@app/services/history/history.service';

@Injectable()
export class LimitedModeService {
    private availableGameByRoomId: Map<string, string[]>;
    constructor(private readonly roomsManagerService: RoomsManagerService, private readonly historyService: HistoryService) {
        this.availableGameByRoomId = new Map<string, string[]>();
    }

    async createLimitedRoom(socket: io.Socket, playerPayLoad: PlayerData, server: io.Server): Promise<void> {
        const limitedRoom = await this.roomsManagerService.createRoom(playerPayLoad);
        if (!limitedRoom) {
            socket.emit(RoomEvents.NoGameAvailible);
            return;
        }
        this.availableGameByRoomId.set(limitedRoom.roomId, [limitedRoom.clientGame.id]);
        socket.join(limitedRoom.roomId);
        server.to(limitedRoom.roomId).emit(RoomEvents.RoomLimitedCreated, limitedRoom.roomId);
        limitedRoom.clientGame.mode = playerPayLoad.gameMode;
        limitedRoom.player1.playerId = socket.id;
        limitedRoom.timer = limitedRoom.gameConstants.countdownTime;
        this.roomsManagerService.updateRoom(limitedRoom);
    }

    async startNextGame(socket: io.Socket, server: io.Server): Promise<void> {
        const room = this.roomsManagerService.getRoomByPlayerId(socket.id);
        if (!room) return;
        const playedGameIds = this.getGameIds(room.roomId);
        const nextGameId = await this.roomsManagerService.loadNextGame(room, playedGameIds);
        this.equalizeDifferencesFound(room, server);
        if (!nextGameId) {
            await this.endGame(room, server);
            return;
        }
        if (playedGameIds) this.availableGameByRoomId.set(room.roomId, [...playedGameIds, nextGameId]);
        this.roomsManagerService.startGame(socket, server);
    }

    joinLimitedCoopRoom(socket: io.Socket, playerPayLoad: PlayerData, server: io.Server): void {
        const room = this.roomsManagerService.getCreatedCoopRoom();
        if (!room) return;
        socket.join(room.roomId);
        room.player2 = { name: playerPayLoad.playerName, playerId: socket.id, differenceData: room.player1.differenceData };
        this.roomsManagerService.updateRoom(room);
        server.to(room.roomId).emit(RoomEvents.LimitedCoopRoomJoined);
    }

    checkIfAnyCoopRoomExists(socket: io.Socket, playerPayLoad: PlayerData, server: io.Server) {
        const room = this.roomsManagerService.getCreatedCoopRoom();
        if (room) this.joinLimitedCoopRoom(socket, playerPayLoad, server);
        else this.createLimitedRoom(socket, playerPayLoad, server);
    }

    deleteAvailableGame(roomId: string): void {
        this.availableGameByRoomId.delete(roomId);
    }

    deletePlayedGameId(roomId: string, gameId: string): void {
        const gameIds = this.availableGameByRoomId.get(roomId);
        if (!gameIds) return;
        const index = gameIds.indexOf(gameId);
        if (index !== NOT_FOUND) {
            gameIds.splice(index, 1);
        }
    }

    handleDeleteGame(gameId: string): void {
        for (const gameIds of this.availableGameByRoomId.values()) {
            gameIds.push(gameId);
        }
    }

    handleDeleteAllGames(): void {
        this.availableGameByRoomId.clear();
    }

    getGameIds(roomId: string): string[] {
        return this.availableGameByRoomId.get(roomId);
    }

    private async endGame(room: GameRoom, server: io.Server): Promise<void> {
        await this.historyService.closeEntry(room.roomId, server);
        this.sendEndMessage(room, server);
        this.roomsManagerService.leaveRoom(room, server);
        this.roomsManagerService.deleteRoom(room.roomId);
        this.deleteAvailableGame(room.roomId);
    }

    private equalizeDifferencesFound(room: GameRoom, server: io.Server): void {
        if (room.clientGame.mode === GameModes.LimitedCoop) {
            server.to(room.roomId).emit(GameEvents.UpdateDifferencesFound, room.player1.differenceData.differencesFound);
        }
    }

    private sendEndMessage(room: GameRoom, server: io.Server): void {
        room.endMessage = `Vous avez trouvé les ${room.player1.differenceData.differencesFound} différences! Bravo!`;
        server.to(room.roomId).emit(GameEvents.EndGame, room.endMessage);
    }
}
