import { Injectable } from '@nestjs/common';
import { RoomsManagerService } from '@app/services/rooms-manager/rooms-manager.service';
import { GameService } from '@app/services/game/game.service';
import { GameEvents, GameModes, Player, playerData } from '@common/game-interfaces';
import * as io from 'socket.io';

@Injectable()
export class LimitedModeService {
    private gamesIds: string[];
    constructor(private readonly roomsManagerService: RoomsManagerService, private readonly gameService: GameService) {
        this.getAllGameIds();
    }

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

    startNextGame(socket: io.Socket, players: Player[], server: io.Server): void {
        const randomIndex = this.generateRandomIndex(this.gamesIds.length);
        const gameId = this.gamesIds[randomIndex];
        this.createSoloLimitedRoom(socket, { playerName: players[0].name, gameId }, server);
        this.takeOutPlayedGameId(gameId);
        this.roomsManagerService.startGame(socket, server);
    }

    private takeOutPlayedGameId(gameId: string): void {
        this.gamesIds = this.gamesIds.filter((id) => id !== gameId);
    }

    private async getAllGameIds(): Promise<void> {
        this.gamesIds = await this.gameService.getAllGameIds();
    }

    private generateRandomIndex(max: number): number {
        return Math.floor(Math.random() * max);
    }
}
