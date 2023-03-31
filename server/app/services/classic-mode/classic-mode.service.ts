// -1 for index of non existing element
/* eslint-disable @typescript-eslint/no-magic-numbers */
// Id comes from database to allow _id
/* eslint-disable no-underscore-dangle */
import { MessageManagerService } from '@app/services/message-manager/message-manager.service';
import { PlayersListManagerService } from '@app/services/players-list-manager/players-list-manager.service';
import { RoomsManagerService } from '@app/services/rooms-manager/rooms-manager.service';
import { GameEvents, GameModes, MessageEvents, PlayerEvents, RoomEvents } from '@common/enums';
import { GameRoom, Player, playerData, RoomAvailability } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import * as io from 'socket.io';

@Injectable()
export class ClassicModeService {
    private roomAvailability: Map<string, RoomAvailability>;

    constructor(
        private readonly roomsManagerService: RoomsManagerService,
        private readonly messageManager: MessageManagerService,
        private readonly playersListManagerService: PlayersListManagerService,
    ) {
        this.roomAvailability = new Map<string, RoomAvailability>();
    }

    async createSoloRoom(socket: io.Socket, playerPayLoad: playerData, server: io.Server): Promise<void> {
        const soloRoom = await this.roomsManagerService.createRoom(playerPayLoad.playerName, playerPayLoad.gameId);
        if (soloRoom) {
            soloRoom.clientGame.mode = GameModes.ClassicSolo;
            soloRoom.player1.playerId = socket.id;
            this.roomsManagerService.updateRoom(soloRoom);
            server.to(socket.id).emit(RoomEvents.RoomSoloCreated, soloRoom.roomId);
        }
    }

    async createOneVsOneRoom(socket: io.Socket, playerPayLoad: playerData, server: io.Server) {
        const oneVsOneRoom = await this.roomsManagerService.createRoom(playerPayLoad.playerName, playerPayLoad.gameId);
        if (oneVsOneRoom) {
            oneVsOneRoom.clientGame.mode = GameModes.ClassicOneVsOne;
            oneVsOneRoom.player1.playerId = socket.id;
            this.roomsManagerService.updateRoom(oneVsOneRoom);
            server.to(socket.id).emit(RoomEvents.RoomOneVsOneCreated, oneVsOneRoom.roomId);
        }
    }

    deleteCreatedRoom(hostId: string, roomId: string, server: io.Server): void {
        const gameId = this.roomsManagerService.getRoomById(roomId)?.clientGame.id;
        this.updateRoomOneVsOneAvailability(hostId, gameId, server);
        this.roomsManagerService.deleteRoom(roomId);
    }

    deleteOneVsOneAvailability(socket: io.Socket, server: io.Server): void {
        const gameId = this.getGameIdByHostId(socket.id);
        if (!gameId) return;
        this.updateRoomOneVsOneAvailability(socket.id, gameId, server);
        this.roomAvailability.delete(gameId);
    }

    async checkStatus(socket: io.Socket, server: io.Server): Promise<void> {
        const roomId = this.roomsManagerService.getRoomIdFromSocket(socket);
        const room = this.roomsManagerService.getRoomById(roomId);
        if (!room) return;
        const halfDifferences = Math.ceil(room.clientGame.differencesCount / 2);
        const player: Player = room.player1.playerId === socket.id ? room.player1 : room.player2;
        if (!player) return;
        if (room.clientGame.differencesCount === player.diffData.differencesFound && room.clientGame.mode === GameModes.ClassicSolo) {
            this.endGame(room, player, server);
            socket.rooms.delete(roomId);
        } else if (halfDifferences === player.diffData.differencesFound && room.clientGame.mode === GameModes.ClassicOneVsOne) {
            this.endGame(room, player, server);
            socket.rooms.delete(roomId);
        }
    }

    async endGame(room: GameRoom, player: Player, server: io.Server): Promise<void> {
        const playerRank = await this.playersListManagerService.updateTopBestTime(room, player.name, server);
        const playerRankMessage = playerRank ? `${player.name} classé ${playerRank}!` : '';
        room.endMessage =
            room.clientGame.mode === GameModes.ClassicOneVsOne
                ? ` remporte la partie avec ${player.diffData.differencesFound} différences trouvées! ${playerRankMessage}`
                : `Vous avez trouvé les ${room.clientGame.differencesCount} différences! Bravo ${playerRankMessage}!`;
        server.to(room.roomId).emit(GameEvents.EndGame, room.endMessage);
        this.playersListManagerService.deleteJoinedPlayersByGameId(room.clientGame.id);
        this.roomsManagerService.deleteRoom(room.roomId);
    }

    updateRoomOneVsOneAvailability(hostId: string, gameId: string, server: io.Server) {
        const roomAvailability = this.roomAvailability.get(gameId) || { gameId, isAvailableToJoin: false, hostId };
        roomAvailability.isAvailableToJoin = !roomAvailability.isAvailableToJoin;
        this.roomAvailability.set(gameId, roomAvailability);
        server.emit(RoomEvents.RoomOneVsOneAvailable, roomAvailability);
    }

    checkRoomOneVsOneAvailability(hostId: string, gameId: string, server: io.Server): void {
        const availabilityData: RoomAvailability = this.roomAvailability.has(gameId)
            ? { gameId, isAvailableToJoin: this.roomAvailability.get(gameId).isAvailableToJoin, hostId }
            : { gameId, isAvailableToJoin: false, hostId };
        server.emit(RoomEvents.RoomOneVsOneAvailable, availabilityData);
    }

    acceptPlayer(acceptedPlayer: Player, roomId: string, server: io.Server): void {
        const room = this.roomsManagerService.getRoomById(roomId);
        if (!room) return;
        this.roomsManagerService.addAcceptedPlayer(roomId, acceptedPlayer);
        server.to(acceptedPlayer.playerId).emit(PlayerEvents.PlayerAccepted, true);
    }

    getGameIdByHostId(playerId: string): string {
        return Array.from(this.roomAvailability.keys()).find((gameId) => {
            const roomAvailability = this.roomAvailability.get(gameId);
            return roomAvailability.hostId === playerId;
        });
    }

    abandonGame(socket: io.Socket, server: io.Server): void {
        const roomId = this.roomsManagerService.getRoomIdByPlayerId(socket.id);
        const room = this.roomsManagerService.getRoomById(roomId);
        if (room && room.clientGame.mode === GameModes.ClassicOneVsOne) {
            const player: Player = room.player1.playerId === socket.id ? room.player1 : room.player2;
            room.endMessage = "L'adversaire a abandonné la partie!";
            const localMessage = this.messageManager.getQuitMessage(player.name);
            server.to(room.roomId).emit(MessageEvents.LocalMessage, localMessage);
            this.roomsManagerService.deleteRoom(roomId);
            server.to(room.roomId).emit(GameEvents.EndGame, room.endMessage);
            socket.rooms.delete(roomId);
        }
    }

    handleSocketDisconnect(socket: io.Socket, server: io.Server): void {
        const roomId = this.roomsManagerService.getRoomIdByPlayerId(socket.id);
        const room = this.roomsManagerService.getRoomById(roomId);
        const createdGameId = this.playersListManagerService.getGameIdByPlayerId(socket.id);
        const joinable = this.roomAvailability.get(room?.clientGame.id)?.isAvailableToJoin;
        if (room && !room.player2 && joinable && room.clientGame.mode === GameModes.ClassicOneVsOne) {
            this.updateRoomOneVsOneAvailability(socket.id, room.clientGame.id, server);
            this.playersListManagerService.cancelAllJoining(room.clientGame.id, server);
            this.roomsManagerService.deleteRoom(roomId);
        } else if (room && room.timer !== 0 && !joinable) {
            this.abandonGame(socket, server);
        } else if (!createdGameId) {
            this.deleteOneVsOneAvailability(socket, server);
        } else {
            const hostId = this.roomsManagerService.getHostIdByGameId(createdGameId);
            this.playersListManagerService.deleteJoinedPlayerByPlayerId(socket.id, createdGameId);
            this.playersListManagerService.getWaitingPlayerNameList(hostId, createdGameId, server);
        }
    }
}
