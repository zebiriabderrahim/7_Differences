// Id comes from database to allow _id
/* eslint-disable no-underscore-dangle */
import { Game } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';
import { HistoryService } from '@app/services/history/history.service';
import { MessageManagerService } from '@app/services/message-manager/message-manager.service';
import { CHARACTERS, KEY_SIZE, MAX_BONUS_TIME_ALLOWED, NOT_FOUND } from '@common/constants';
import { GameEvents, GameModes, MessageEvents } from '@common/enums';
import { ClientSideGame, Coordinate, Differences, GameRoom, Player } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as io from 'socket.io';

@Injectable()
export class RoomsManagerService {
    private rooms: Map<string, GameRoom>;

    constructor(
        private readonly gameService: GameService,
        private readonly messageManager: MessageManagerService,
        private readonly historyService: HistoryService,
    ) {
        this.rooms = new Map<string, GameRoom>();
    }

    async createRoom(playerName: string, gameId: string, gameMode: GameModes): Promise<GameRoom> {
        const game =
            gameMode === GameModes.LimitedSolo || gameMode === GameModes.LimitedCoop
                ? await this.gameService.getRandomGame([])
                : await this.gameService.getGameById(gameId);
        if (!game) return;
        const gameConstants = await this.gameService.getGameConstants();
        const diffData = { currentDifference: [], differencesFound: 0 } as Differences;
        const player = { name: playerName, diffData } as Player;
        const room: GameRoom = {
            roomId: this.generateRoomId(),
            clientGame: this.buildClientGameVersion(game),
            timer: 0,
            endMessage: '',
            originalDifferences: structuredClone(JSON.parse(fs.readFileSync(`assets/${game.name}/differences.json`, 'utf-8'))),
            player1: player,
            gameConstants,
        };
        room.clientGame.mode = gameMode;
        return room;
    }

    getRoomById(roomId: string): GameRoom {
        if (this.rooms.has(roomId)) {
            return this.rooms.get(roomId);
        }
    }

    getRoomIdFromSocket(socket: io.Socket): string {
        return Array.from(socket.rooms.values())[1];
    }

    getRoomIdByPlayerId(playerId: string): string {
        return Array.from(this.rooms.keys()).find((roomId) => {
            const room = this.rooms.get(roomId);
            return room.player1?.playerId === playerId || room.player2?.playerId === playerId;
        });
    }

    getOneVsOneRoomByGameId(gameId: string): GameRoom {
        return Array.from(this.rooms.values()).find((room) => room.clientGame.id === gameId && room.clientGame.mode === GameModes.ClassicOneVsOne);
    }

    getHostIdByGameId(gameId: string): string {
        const roomTarget = Array.from(this.rooms.values()).find((room) => room.clientGame.id === gameId);
        return roomTarget?.player1.playerId;
    }

    getLimitedRoom(): GameRoom {
        return Array.from(this.rooms.values()).find((room) => room.clientGame.mode === GameModes.LimitedCoop && !room.player2);
    }

    getAllLimitedRoomIds(): string[] {
        return Array.from(this.rooms.values())
            .filter((room) => room.clientGame.mode.startsWith('Limited'))
            .map((room) => room.roomId);
    }

    addAcceptedPlayer(roomId: string, player: Player): void {
        const room = this.getRoomById(roomId);
        room.player2 = player;
        this.updateRoom(room);
    }

    updateRoom(room: GameRoom): void {
        this.rooms.set(room.roomId, room);
    }

    deleteRoom(roomId: string): void {
        this.rooms.delete(roomId);
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

    startGame(socket: io.Socket, server: io.Server): void {
        const roomId = this.getRoomIdByPlayerId(socket.id);
        const room = this.getRoomById(roomId);
        this.historyService.createEntry(room);
        if (!room && room?.player1.playerId !== socket.id && room?.player2.playerId !== socket.id) return;
        socket.join(roomId);
        this.updateRoom(room);
        server.to(roomId).emit(GameEvents.GameStarted, room);
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
        if (index !== NOT_FOUND) {
            diffData.differencesFound++;
            this.addBonusTime(room);
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
        const cheatDifferences = room.originalDifferences;
        server.to(room.roomId).emit(GameEvents.RemoveDiff, { differencesData, playerId: socket.id, cheatDifferences });
    }

    updateTimers(server: io.Server) {
        for (const [roomId, room] of this.rooms) {
            if (room.clientGame.mode === GameModes.ClassicSolo || (room.player2 && room.clientGame.mode === GameModes.ClassicOneVsOne)) {
                this.updateTimer(roomId, server);
            } else if (room.clientGame.mode === GameModes.LimitedSolo || (room.player2 && room.clientGame.mode === GameModes.LimitedCoop)) {
                this.countdown(roomId, server);
            }
        }
    }

    addHintPenalty(socket: io.Socket, server: io.Server): void {
        const roomId = this.getRoomIdFromSocket(socket);
        const room = this.getRoomById(roomId);
        if (!room) return;
        const { clientGame, gameConstants, timer } = room;
        let penaltyTime = gameConstants.penaltyTime;

        if (this.isLimitedMode(clientGame)) penaltyTime = -penaltyTime;

        if (timer + penaltyTime < 0) {
            this.countdownIsOver(roomId, server);
        } else {
            room.timer += penaltyTime;
            this.rooms.set(room.roomId, room);
            server.to(room.roomId).emit(GameEvents.TimerUpdate, room.timer);
        }
    }

    async loadNextGame(room: GameRoom, playedGameIds: string[]): Promise<string> {
        const game = await this.gameService.getRandomGame(playedGameIds);
        if (!game) return;
        const gameMode = room.clientGame.mode;
        room.clientGame = this.buildClientGameVersion(game);
        room.clientGame.mode = gameMode;
        room.originalDifferences = structuredClone(JSON.parse(fs.readFileSync(`assets/${game.name}/differences.json`, 'utf-8')));
        this.updateRoom(room);
        return game._id.toString();
    }

    isLimitedMode(clientGame: ClientSideGame): boolean {
        return clientGame.mode === GameModes.LimitedSolo || clientGame.mode === GameModes.LimitedCoop;
    }

    leaveRoom(room: GameRoom, server: io.Server): void {
        server.sockets.sockets.get(room.player1.playerId)?.rooms.delete(room.roomId);
        if (room.player2) {
            server.sockets.sockets.get(room.player2.playerId)?.rooms.delete(room.roomId);
        }
    }

    abandonGame(socket: io.Socket, server: io.Server): void {
        const roomId = this.getRoomIdByPlayerId(socket.id);
        const room = this.getRoomById(roomId);
        if (!room) return;
        const player: Player = room.player1.playerId === socket.id ? room.player1 : room.player2;
        const opponent: Player = room.player1.playerId === socket.id ? room.player2 : room.player1;
        console.log(`${player.name} has left the room ${roomId}`);
        this.historyService.markPlayerAsQuitter(roomId, player.name);
        if (room.clientGame.mode === GameModes.ClassicOneVsOne) {
            room.endMessage = "L'adversaire a abandonné la partie!";
            this.abandonMessage(room, player, server);
            server.to(room.roomId).emit(GameEvents.EndGame, room.endMessage);
            this.historyService.markPlayerAsWinner(roomId, opponent.name);
            this.historyService.closeEntry(roomId, server);
            this.deleteRoom(roomId);
        }
        if (room.clientGame.mode === GameModes.LimitedCoop) {
            this.abandonMessage(room, player, server);
            server.to(opponent?.playerId)?.emit(GameEvents.GameModeChanged);
            room.clientGame.mode = GameModes.LimitedSolo;
            this.updateRoom(room);
        }
        socket.leave(roomId);
    }

    handelDisconnect(room: GameRoom): void {
        if (room && !room.player2) this.deleteRoom(room.roomId);
    }

    private abandonMessage(room: GameRoom, player: Player, server: io.Server): void {
        const localMessage = this.messageManager.getQuitMessage(player.name);
        server.to(room.roomId).emit(MessageEvents.LocalMessage, localMessage);
    }

    private addBonusTime(room: GameRoom): void {
        if (!this.isLimitedMode(room.clientGame)) return;
        room.timer += room.gameConstants.bonusTime;

        if (room.timer > MAX_BONUS_TIME_ALLOWED) {
            room.timer = MAX_BONUS_TIME_ALLOWED;
        }
        this.rooms.set(room.roomId, room);
    }

    private updateTimer(roomId: string, server: io.Server): void {
        const room = this.rooms.get(roomId);
        if (!room) return;
        room.timer++;
        this.rooms.set(room.roomId, room);
        server.to(room.roomId).emit(GameEvents.TimerUpdate, room.timer);
    }

    private countdown(roomId: string, server: io.Server): void {
        const room = this.rooms.get(roomId);
        if (!room || room.timer === 0) return;

        room.timer--;
        this.rooms.set(room.roomId, room);
        server.to(room.roomId).emit(GameEvents.TimerUpdate, room.timer);

        if (room.timer === 0) this.countdownIsOver(roomId, server);
    }

    private countdownIsOver(roomId: string, server: io.Server): void {
        const room = this.rooms.get(roomId);
        if (!room) return;
        room.endMessage = 'Temps écoulé !';
        server.to(room.roomId).emit(GameEvents.EndGame, room.endMessage);
        this.deleteRoom(room.roomId);
        server.sockets.sockets.get(room.player1.playerId)?.rooms.delete(roomId);
        if (room.player2) {
            server.sockets.sockets.get(room.player2.playerId)?.rooms.delete(roomId);
        }
    }

    private generateRoomId(): string {
        let id = '';
        for (let i = 0; i < KEY_SIZE; i++) {
            id += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
        }
        return id;
    }
}
