import { GameService } from '@app/services/game/game.service';
import { RoomsManagerService } from '@app/services/rooms-manager/rooms-manager.service';
import { NOT_FOUND } from '@common/constants';
import { GameEvents, RoomEvents, GameModes } from '@common/enums';
import { GameRoom, LimitedGameDetails } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import * as io from 'socket.io';

@Injectable()
export class LimitedModeService {
    private availableGameByRoomId: Map<string, string[]>;
    constructor(private readonly roomsManagerService: RoomsManagerService, private readonly gameService: GameService) {
        this.availableGameByRoomId = new Map<string, string[]>();
    }

    async createLimitedRoom(socket: io.Socket, gameDetails: LimitedGameDetails, server: io.Server): Promise<void> {
        const limitedRoom = await this.roomsManagerService.createRoom(gameDetails.playerName, '', gameDetails.gameMode);
        if (!limitedRoom) return;
        this.availableGameByRoomId.set(limitedRoom.roomId, [limitedRoom.clientGame.id]);
        if (limitedRoom) {
            socket.join(limitedRoom.roomId);
            server.to(limitedRoom.roomId).emit(RoomEvents.RoomLimitedCreated, limitedRoom.roomId);
            limitedRoom.clientGame.mode = gameDetails.gameMode;
            limitedRoom.player1.playerId = socket.id;
            limitedRoom.timer = limitedRoom.gameConstants.countdownTime;
            this.roomsManagerService.updateRoom(limitedRoom);
        }
    }

    async startNextGame(socket: io.Socket, server: io.Server): Promise<void> {
        const roomId = this.roomsManagerService.getRoomIdByPlayerId(socket.id);
        const room = this.roomsManagerService.getRoomById(roomId);
        if (!room) return;
        const playedGameIds = this.getGameIds(roomId);
        const nextGameId = await this.roomsManagerService.loadNextGame(room, playedGameIds);
        if (!nextGameId) this.endGame(roomId, server);
        if (playedGameIds) this.availableGameByRoomId.set(roomId, [...playedGameIds, nextGameId]);
        this.equalizeDiffFound(room, server);
        this.roomsManagerService.startGame(socket, server);
    }

    joinLimitedCoopRoom(socket: io.Socket, gameDetails: LimitedGameDetails, server: io.Server): void {
        const room = this.roomsManagerService.getLimitedRoom();
        if (room) {
            socket.join(room.roomId);
            room.player2 = {
                name: gameDetails.playerName,
                playerId: socket.id,
                diffData: room.player1.diffData,
            };
            this.roomsManagerService.updateRoom(room);
            server.to(room.roomId).emit(RoomEvents.LimitedCoopRoomJoined);
        }
    }

    checkIfAnyCoopRoomExists(socket: io.Socket, gameDetails: LimitedGameDetails, server: io.Server) {
        const roomId = this.roomsManagerService.getLimitedRoom()?.roomId;
        if (roomId) {
            this.joinLimitedCoopRoom(socket, gameDetails, server);
        } else {
            this.createLimitedRoom(socket, gameDetails, server);
        }
    }

    endGame(roomId: string, server: io.Server): void {
        const room = this.roomsManagerService.getRoomById(roomId);
        if (!room) return;
        this.sendEndMessage(roomId, server);
        this.roomsManagerService.leaveRoom(room, server);
        this.roomsManagerService.deleteRoom(roomId);
        this.deleteAvailableGame(roomId);
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

    handleDeleteAllGame(): void {
        this.availableGameByRoomId.clear();
    }

    getGameIds(roomId: string): string[] {
        return this.availableGameByRoomId.get(roomId);
    }

    private equalizeDiffFound(room: GameRoom, server: io.Server): void {
        if (room.clientGame.mode === GameModes.LimitedCoop) {
            server.to(room.roomId).emit(GameEvents.UpdateDifferencesFound, room.player1.diffData.differencesFound);
        }
    }

    private sendEndMessage(roomId: string, server: io.Server): void {
        const room = this.roomsManagerService.getRoomById(roomId);
        room.endMessage = `Vous avez trouvé les ${room.clientGame.differencesCount} différences! Bravo ${room?.player1.name}!`;
        server.to(room.roomId).emit(GameEvents.EndGame, room.endMessage);
    }
}
