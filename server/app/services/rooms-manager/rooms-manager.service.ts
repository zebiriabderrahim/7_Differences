// Id comes from database to allow _id
/* eslint-disable no-underscore-dangle */
import { Game } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';
import { CHARACTERS, KEY_SIZE, NOT_FOUND } from '@common/constants';
import { ClassicPlayRoom, ClientSideGame, Coordinate, Differences, Player } from '@common/game-interfaces';
import { GameEvents, GameModes, MessageEvents } from '@common/enums';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as io from 'socket.io';
import { MessageManagerService } from '@app/services/message-manager/message-manager.service';

@Injectable()
export class RoomsManagerService {
    private rooms: Map<string, ClassicPlayRoom>;

    constructor(private readonly gameService: GameService, private readonly messageManager: MessageManagerService) {
        this.rooms = new Map<string, ClassicPlayRoom>();
    }

    async createRoom(playerName: string, gameId: string): Promise<ClassicPlayRoom> {
        const game = await this.gameService.getGameById(gameId);
        const gameConstants = await this.gameService.getGameConstants();
        const diffData = { currentDifference: [], differencesFound: 0 } as Differences;
        const player = { name: playerName, diffData } as Player;
        const room: ClassicPlayRoom = {
            roomId: this.generateRoomId(),
            clientGame: this.buildClientGameVersion(game),
            timer: 0,
            endMessage: '',
            originalDifferences: structuredClone(JSON.parse(fs.readFileSync(`assets/${game.name}/differences.json`, 'utf-8'))),
            player1: player,
            gameConstants,
        };
        return room;
    }

    getRoomById(roomId: string): ClassicPlayRoom {
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

    getOneVsOneRoomByGameId(gameId: string): ClassicPlayRoom {
        return Array.from(this.rooms.values()).find((room) => room.clientGame.id === gameId && room.clientGame.mode === GameModes.ClassicOneVsOne);
    }

    getHostIdByGameId(gameId: string): string {
        const roomTarget = Array.from(this.rooms.values()).find(
            (room) => room.clientGame.id === gameId && room.clientGame.mode === GameModes.ClassicOneVsOne && room.timer === 0,
        );
        return roomTarget?.player1.playerId;
    }

    addAcceptedPlayer(roomId: string, player: Player): void {
        const room = this.getRoomById(roomId);
        room.player2 = player;
        this.updateRoom(room);
    }

    updateRoom(room: ClassicPlayRoom): void {
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
        if (!room && room?.player1.playerId !== socket.id && room?.player2.playerId !== socket.id) return;
        socket.join(roomId);
        this.updateRoom(room);
        server.to(roomId).emit(GameEvents.GameStarted, {
            clientGame: room.clientGame,
            players: { player1: room.player1, player2: room.player2 },
            cheatDifferences: room.originalDifferences.flat(),
        });
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

    updateTimers(server: io.Server) {
        for (const [roomId, room] of this.rooms) {
            if (room.clientGame.mode === GameModes.ClassicSolo || (room.player2 && room.clientGame.mode === GameModes.ClassicOneVsOne)) {
                this.updateTimer(roomId, server);
            } else if (room.clientGame.mode === GameModes.LimitedCoop || room.clientGame.mode === GameModes.LimitedSolo) {
                this.countdown(roomId, server);
            }
        }
    }

    private updateTimer(roomId: string, server: io.Server): void {
        const room = this.rooms.get(roomId);
        if (room) {
            room.timer++;
            this.rooms.set(room.roomId, room);
            server.to(room.roomId).emit(GameEvents.TimerStarted, room.timer);
        }
    }

    private countdown(roomId: string, server: io.Server): void {
        const room = this.rooms.get(roomId);
        if (room && room.timer > 0) {
            room.gameConstants.countdownTime--;
            this.rooms.set(room.roomId, room);
            server.to(room.roomId).emit(GameEvents.TimerStarted, room.gameConstants.countdownTime);
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
