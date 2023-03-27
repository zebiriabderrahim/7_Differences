// -1 for index of non existing element
/* eslint-disable @typescript-eslint/no-magic-numbers */
// Id comes from database to allow _id
/* eslint-disable no-underscore-dangle */
import { Game } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';
import { MessageManagerService } from '@app/services/message-manager/message-manager.service';
import { PlayersListManagerService } from '@app/services/players-list-manager/players-list-manager.service';
import { Coordinate } from '@common/coordinate';
import {
    ChatMessage,
    ClassicPlayRoom,
    ClientSideGame,
    Differences,
    GameEvents,
    GameModes,
    MessageEvents,
    Player,
    playerData,
    RoomAvailability,
} from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as io from 'socket.io';

@Injectable()
export class ClassicModeService {
    private rooms: Map<string, ClassicPlayRoom>;
    private roomAvailability: Map<string, RoomAvailability>;

    constructor(
        private readonly gameService: GameService,
        private readonly messageManager: MessageManagerService,
        private readonly playersListManagerService: PlayersListManagerService,
    ) {
        this.rooms = new Map<string, ClassicPlayRoom>();
        this.roomAvailability = new Map<string, RoomAvailability>();
    }

    async createRoom(playerName: string, gameId: string): Promise<ClassicPlayRoom> {
        const game = await this.gameService.getGameById(gameId);
        const diffData = { currentDifference: [], differencesFound: 0 } as Differences;
        const player = { name: playerName, diffData } as Player;
        const room: ClassicPlayRoom = {
            roomId: this.generateRoomId(),
            clientGame: this.buildClientGameVersion(game),
            timer: 0,
            endMessage: '',
            originalDifferences: structuredClone(JSON.parse(fs.readFileSync(`assets/${game.name}/differences.json`, 'utf-8'))),
            player1: player,
        };
        return room;
    }

    async createSoloRoom(socket: io.Socket, playerPayLoad: playerData, server: io.Server): Promise<void> {
        const room = await this.createRoom(playerPayLoad.playerName, playerPayLoad.gameId);
        if (room) {
            room.clientGame.mode = GameModes.ClassicSolo;
            room.player1.playerId = socket.id;
            this.saveRoom(room);
            server.to(socket.id).emit(GameEvents.RoomSoloCreated, room.roomId);
        }
    }

    async createOneVsOneRoom(socket: io.Socket, playerPayLoad: playerData, server: io.Server) {
        const room = await this.createRoom(playerPayLoad.playerName, playerPayLoad.gameId);
        if (room) {
            room.clientGame.mode = GameModes.ClassicOneVsOne;
            room.player1.playerId = socket.id;
            this.saveRoom(room);
            server.to(socket.id).emit(GameEvents.RoomOneVsOneCreated, room.roomId);
        }
    }

    startGame(socket: io.Socket, server: io.Server): void {
        const roomId = this.getRoomIdByPlayerId(socket.id);
        const room = this.getRoomById(roomId);
        if (!room && room?.player1.playerId !== socket.id && room?.player2.playerId !== socket.id) return;
        socket.join(roomId);
        this.saveRoom(room);
        server.to(roomId).emit(GameEvents.GameStarted, {
            clientGame: room.clientGame,
            players: { player1: room.player1, player2: room.player2 },
            cheatDifferences: room.originalDifferences.flat(),
        });
    }

    updateTimer(roomId: string, server: io.Server): void {
        const room = this.rooms.get(roomId);
        if (room) {
            room.timer++;
            this.rooms.set(room.roomId, room);
            server.to(room.roomId).emit(GameEvents.TimerStarted, room.timer);
        }
    }

    getRoomIdFromSocket(socket: io.Socket): string {
        return Array.from(socket.rooms.values())[1];
    }

    verifyCoords(socket: io.Socket, coords: Coordinate, server: io.Server): void {
        const roomId = this.getRoomIdFromSocket(socket);
        const room = this.rooms.get(roomId);
        if (!room) return;

        const player = room.player1.playerId === socket.id ? room.player1 : room.player2;
        const { originalDifferences } = room;
        const { diffData, name } = player;

        const index = originalDifferences.findIndex((difference) =>
            difference.some((coord: Coordinate) => coord.x === coords.x && coord.y === coords.y),
        );
        if (index !== -1) {
            diffData.differencesFound++;
            diffData.currentDifference = originalDifferences[index];
            originalDifferences.splice(index, 1);
            const localMessage = this.messageManager.getLocalMessage(room.clientGame.mode, true, name);
            server.to(room.roomId).emit(MessageEvents.LocalMessage, localMessage);
        } else {
            diffData.currentDifference = [];
            const localMessage = this.messageManager.getLocalMessage(room.clientGame.mode, false, name);
            server.to(room.roomId).emit(MessageEvents.LocalMessage, localMessage);
        }

        this.rooms.set(roomId, room);

        const differencesData = { currentDifference: diffData.currentDifference, differencesFound: diffData.differencesFound } as Differences;
        const cheatDifferences = room.originalDifferences.flat();
        server.to(room.roomId).emit(GameEvents.RemoveDiff, { differencesData, playerId: socket.id, cheatDifferences });
    }

    buildClientGameVersion(game: Game): ClientSideGame {
        const clientGame: ClientSideGame = {
            id: game._id.toString(),
            name: game.name,
            mode: '',
            original: 'data:image/png;base64,'.concat(fs.readFileSync(`assets/${game.name}/original.bmp`, 'base64')),
            modified: 'data:image/png;base64,'.concat(fs.readFileSync(`assets/${game.name}/modified.bmp`, 'base64')),
            isHard: game.isHard,
            differencesCount: game.nDifference,
        };
        return clientGame;
    }

    deleteOneVsOneRoomAvailability(gameId: string, server: io.Server): void {
        this.updateRoomOneVsOneAvailability(gameId, server);
    }

    deleteCreatedRoom(roomId: string, server: io.Server): void {
        const gameId = this.rooms.get(roomId)?.clientGame.id;
        this.updateRoomOneVsOneAvailability(gameId, server);
        this.rooms.delete(roomId);
    }

    endGame(socket: io.Socket, server: io.Server): void {
        const roomId = this.getRoomIdFromSocket(socket);
        const room = this.getRoomById(roomId);
        if (!room) return;
        const player: Player = room.player1.playerId === socket.id ? room.player1 : room.player2;
        if (room && room.clientGame.differencesCount === player.diffData.differencesFound && room.clientGame.mode === GameModes.ClassicSolo) {
            room.endMessage = `Vous avez trouvé les ${room.clientGame.differencesCount} différences! Bravo!`;
            server.to(roomId).emit(GameEvents.EndGame, room.endMessage);
            this.rooms.delete(roomId);
        } else if (
            room &&
            Math.ceil(room.clientGame.differencesCount / 2) === player.diffData.differencesFound &&
            room.clientGame.mode === GameModes.ClassicOneVsOne
        ) {
            room.endMessage = `${player.name} remporte la partie avec ${player.diffData.differencesFound} différences trouvées!`;
            server.to(roomId).emit(GameEvents.EndGame, room.endMessage);
            this.playersListManagerService.deleteJoinedPlayersByGameId(room.clientGame.id);
            this.rooms.delete(roomId);
        }
    }

    getRoomById(roomId: string): ClassicPlayRoom {
        if (this.rooms.has(roomId)) {
            return this.rooms.get(roomId);
        }
    }

    updateRoomOneVsOneAvailability(gameId: string, server: io.Server) {
        const roomAvailability = this.roomAvailability.get(gameId) || { gameId, isAvailableToJoin: false };
        roomAvailability.isAvailableToJoin = !roomAvailability.isAvailableToJoin;
        this.roomAvailability.set(gameId, roomAvailability);
        server.emit(GameEvents.RoomOneVsOneAvailable, roomAvailability);
    }

    checkRoomOneVsOneAvailability(gameId: string, server: io.Server): void {
        const availabilityData: RoomAvailability = this.roomAvailability.has(gameId)
            ? { gameId, isAvailableToJoin: this.roomAvailability.get(gameId).isAvailableToJoin }
            : { gameId, isAvailableToJoin: false };
        server.emit(GameEvents.RoomOneVsOneAvailable, availabilityData);
    }

    getOneVsOneRoomByGameId(gameId: string): ClassicPlayRoom {
        return Array.from(this.rooms.values()).find((room) => room.clientGame.id === gameId && room.clientGame.mode === GameModes.ClassicOneVsOne);
    }

    getHostIdByGameId(gameId: string): string {
        const roomTarget = Array.from(this.rooms.values()).find(
            (room) => room.clientGame.id === gameId && room.clientGame.mode === GameModes.ClassicOneVsOne && room.timer === 0,
        );
        return roomTarget?.player1.playerId;
    }

    saveRoom(room: ClassicPlayRoom): void {
        this.rooms.set(room.roomId, room);
    }

    acceptPlayer(acceptedPlayer: Player, roomId: string, server: io.Server): void {
        const room = this.rooms.get(roomId);
        if (!room) return;
        if (!acceptedPlayer) return;
        room.player2 = acceptedPlayer;
        this.rooms.set(roomId, room);
        server.to(acceptedPlayer.playerId).emit(GameEvents.PlayerAccepted, true);
    }

    getRoomIdByPlayerId(playerId: string): string {
        return Array.from(this.rooms.keys()).find((roomId) => {
            const room = this.rooms.get(roomId);
            return room.player1?.playerId === playerId || room.player2?.playerId === playerId;
        });
    }

    abandonGame(socket: io.Socket, server: io.Server): void {
        const roomId = this.getRoomIdByPlayerId(socket.id);
        const room = this.getRoomById(roomId);
        if (room && room.clientGame.mode === GameModes.ClassicOneVsOne) {
            const player: Player = room.player1.playerId === socket.id ? room.player1 : room.player2;
            room.endMessage = "L'adversaire a abandonné la partie!";
            const localMessage: ChatMessage = this.messageManager.getQuitMessage(player.name);
            server.to(room.roomId).emit(MessageEvents.LocalMessage, localMessage);
            this.rooms.delete(roomId);
            server.to(room.roomId).emit(GameEvents.EndGame, room.endMessage);
        }
    }

    handleSocketDisconnect(socket: io.Socket, server: io.Server): void {
        const roomId = this.getRoomIdByPlayerId(socket.id);
        const room = this.getRoomById(roomId);
        const joinable = this.roomAvailability.get(room?.clientGame.id)?.isAvailableToJoin;
        if (room && !room.player2 && joinable && room.clientGame.mode === GameModes.ClassicOneVsOne) {
            this.playersListManagerService.cancelAllJoining(room.clientGame.id, server);
            this.rooms.delete(roomId);
        } else if (room && room.timer !== 0 && !joinable) {
            this.abandonGame(socket, server);
        } else {
            const gameId = this.playersListManagerService.deleteJoinedPlayerByPlayerId(socket.id);
            const hostId = this.getHostIdByGameId(gameId);
            this.playersListManagerService.getWaitingPlayerNameList(hostId, gameId, server);
        }
    }
    private generateRoomId(): string {
        const KEY_SIZE = 36;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let id = '';
        for (let i = 0; i < KEY_SIZE; i++) {
            id += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return id;
    }
}
