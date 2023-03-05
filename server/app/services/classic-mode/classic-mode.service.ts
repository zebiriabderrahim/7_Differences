// Id comes from database to allow _id
/* eslint-disable no-underscore-dangle */
import { Game } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';
import { Coordinate } from '@common/coordinate';
import { ClassicPlayRoom, ClientSideGame, Differences, GameEvents, GameModes } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as io from 'socket.io';

@Injectable()
export class ClassicModeService {
    private rooms: Map<string, ClassicPlayRoom>;
    private joinedPlayerNamesByGameId: Map<string, string[]>;

    constructor(private readonly gameService: GameService) {
        this.rooms = new Map<string, ClassicPlayRoom>();
        this.joinedPlayerNamesByGameId = new Map<string, string[]>();
    }

    async createRoom(socket: io.Socket, playerName: string, gameId: string): Promise<ClassicPlayRoom> {
        const game = await this.gameService.getGameById(gameId);
        const diffData: Differences = {
            currentDifference: [],
            differencesFound: 0,
        };
        const room: ClassicPlayRoom = {
            roomId: this.generateRoomId(),
            clientGame: this.buildClientGameVersion(playerName, game),
            timer: 0,
            endMessage: '',
            differencesData: diffData,
            originalDifferences: structuredClone(JSON.parse(fs.readFileSync(`assets/${game.name}/differences.json`, 'utf-8'))),
            isAvailableToJoin: true,
        };
        return room;
    }

    updateTimer(roomId: string, server: io.Server): void {
        const room = this.rooms.get(roomId);
        if (room) {
            room.timer++;
            server.to(roomId).emit(GameEvents.TimerStarted, room.timer);
        }
    }

    verifyCoords(roomId: string, coords: Coordinate, server: io.Server): void {
        const room = this.rooms.get(roomId);
        const { originalDifferences } = room;
        let index = 0;
        for (; index < originalDifferences.length; index++) {
            if (originalDifferences[index].some((coord: Coordinate) => coord.x === coords.x && coord.y === coords.y)) {
                room.differencesData.differencesFound++;
                room.differencesData.currentDifference = originalDifferences[index];
                break;
            }
        }

        if (index !== originalDifferences.length) {
            originalDifferences.splice(index, 1);
        } else {
            room.differencesData.currentDifference = [];
        }

        this.rooms.set(room.roomId, room);
        const diffData: Differences = {
            currentDifference: room.differencesData.currentDifference,
            differencesFound: room.differencesData.differencesFound,
        };
        server.to(room.roomId).emit(GameEvents.RemoveDiff, diffData);
    }

    buildClientGameVersion(playerName: string, game: Game): ClientSideGame {
        const clientGame: ClientSideGame = {
            id: game._id.toString(),
            player: playerName,
            name: game.name,
            mode: '',
            original: 'data:image/png;base64,'.concat(fs.readFileSync(`assets/${game.name}/original.bmp`, 'base64')),
            modified: 'data:image/png;base64,'.concat(fs.readFileSync(`assets/${game.name}/modified.bmp`, 'base64')),
            isHard: game.isHard,
            differencesCount: game.nDifference,
        };
        return clientGame;
    }
    deleteCreatedSoloGameRoom(roomId: string): void {
        this.rooms.delete(roomId);
    }

    endGame(roomId: string, server: io.Server): void {
        const room = this.rooms.get(roomId);
        if (room && room.clientGame.differencesCount === room.differencesData.differencesFound) {
            room.endMessage = `Vous avez trouvé les ${room.clientGame.differencesCount} différences! Bravo!`;
            server.to(room.roomId).emit(GameEvents.EndGame, room.endMessage);
            this.deleteCreatedSoloGameRoom(room.roomId);
        }
    }

    generateRoomId(): string {
        const KEY_SIZE = 36;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let id = '';
        for (let i = 0; i < KEY_SIZE; i++) {
            id += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return id;
    }

    getOneVsOneRoomByGameId(gameId: string): ClassicPlayRoom {
        return Array.from(this.rooms.values()).find((room) => room.clientGame.id === gameId && room.clientGame.mode === GameModes.ClassicOneVsOne);
    }

    checkRoomOneVsOneAvailability(gameId: string, server: io.Server): void {
        const roomTarget = this.getOneVsOneRoomByGameId(gameId);
        if (roomTarget) {
            server.emit(GameEvents.RoomOneVsOneAvailable, { gameId, isAvailableToJoin: roomTarget.isAvailableToJoin });
        }
    }

    updateRoomOneVsOneAvailability(gameId: string, isAvailableToJoin: boolean, server: io.Server): void {
        const roomTarget = this.getOneVsOneRoomByGameId(gameId);
        if (roomTarget) {
            roomTarget.isAvailableToJoin = isAvailableToJoin;
            this.rooms.set(roomTarget.roomId, roomTarget);
            server.emit(GameEvents.RoomOneVsOneAvailable, { gameId, isAvailableToJoin });
        }
    }

    deleteCreatedOneVsOneRoom(gameId: string, server: io.Server): void {
        this.rooms.delete(this.getOneVsOneRoomByGameId(gameId).roomId);
        server.emit(GameEvents.DeleteCreatedOneVsOneRoom, gameId);
    }

    saveRoom(room: ClassicPlayRoom, socket: io.Socket): void {
        socket.join(room.roomId);
        this.rooms.set(room.roomId, room);
    }

    updateWaitingPlayerNameList(gameId: string, playerName: string, server: io.Server): void {
        const playerNames = this.joinedPlayerNamesByGameId.get(gameId);
        if (playerNames) {
            playerNames.push(playerName);
        } else {
            this.joinedPlayerNamesByGameId.set(gameId, [playerName]);
        }
        const playerNamesList = this.joinedPlayerNamesByGameId.get(gameId);
        const roomTarget = this.getOneVsOneRoomByGameId(gameId);
        server.to(roomTarget.roomId).emit(GameEvents.UpdateWaitingPlayerNameList, { gameId, playerNamesList });
    }

    getWaitingPlayerNameList(gameId: string): string[] {
        return this.joinedPlayerNamesByGameId.get(gameId);
    }

    refusePlayer(gameId: string, playerNamesList: string[], server: io.Server): void {
        this.joinedPlayerNamesByGameId.set(gameId, playerNamesList);
        const roomTarget = this.getOneVsOneRoomByGameId(gameId);
        server.to(roomTarget.roomId).emit(GameEvents.UpdateWaitingPlayerNameList, { gameId, playerNamesList });
    }
}
