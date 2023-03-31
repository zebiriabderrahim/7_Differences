import { Injectable } from '@nestjs/common';
import { RoomsManagerService } from '@app/services/rooms-manager/rooms-manager.service';
import { GameEvents, GameModes, playerData } from '@common/game-interfaces';
import * as io from 'socket.io';

@Injectable()
export class LimitedModeService {
    constructor(private readonly roomsManagerService: RoomsManagerService) {}

    async createSoloLimitedRoom(socket: io.Socket, playerPayLoad: playerData, server: io.Server): Promise<void> {
        const limitedRoom = await this.roomsManagerService.createRoom(playerPayLoad.playerName, playerPayLoad.gameId);
        if (limitedRoom) {
            limitedRoom.clientGame.mode = GameModes.LimitedSolo;
            limitedRoom.player1.playerId = socket.id;
            this.roomsManagerService.updateRoom(limitedRoom);
            server.to(socket.id).emit(GameEvents.RoomLimitedCreated, limitedRoom.roomId);
        }
    }

    async createOneVsOneLimitedRoom(socket: io.Socket, playerPayLoad: playerData, server: io.Server) {
        const oneVsOneRoom = await this.roomsManagerService.createRoom(playerPayLoad.playerName, playerPayLoad.gameId);
        if (oneVsOneRoom) {
            oneVsOneRoom.clientGame.mode = GameModes.LimitedCoop;
            oneVsOneRoom.player1.playerId = socket.id;
            this.roomsManagerService.updateRoom(oneVsOneRoom);
            server.to(socket.id).emit(GameEvents.RoomOneVsOneCreated, oneVsOneRoom.roomId);
        }
    }
}
