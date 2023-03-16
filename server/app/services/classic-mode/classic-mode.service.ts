// -1 for index of non existing element
/* eslint-disable @typescript-eslint/no-magic-numbers */
// Id comes from database to allow _id
/* eslint-disable no-underscore-dangle */
import { Game } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';
import { Coordinate } from '@common/coordinate';
import {
    ClassicPlayRoom,
    ClientSideGame,
    Differences,
    GameEvents,
    GameModes,
    Player,
    PlayerNameAvailability,
    RoomAvailability,
    WaitingPlayerNameList,
} from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as io from 'socket.io';

@Injectable()
export class ClassicModeService {
    private rooms: Map<string, ClassicPlayRoom>;
    private joinedPlayerNamesByGameId: Map<string, string[]>;
    private roomAvailability: Map<string, RoomAvailability>;

    constructor(private readonly gameService: GameService) {
        this.rooms = new Map<string, ClassicPlayRoom>();
        this.joinedPlayerNamesByGameId = new Map<string, string[]>();
        this.roomAvailability = new Map<string, RoomAvailability>();
    }

    async createRoom(playerName: string, gameId: string): Promise<ClassicPlayRoom> {
        const game = await this.gameService.getGameById(gameId);
        const diffData: Differences = {
            currentDifference: [],
            differencesFound: 0,
        };
        const player: Player = {
            name: playerName,
            diffData,
        };
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

    async createOneVsOneGame(gameId: string, playerName: string) {
        const room = await this.createRoom(playerName, gameId);
        if (room) {
            const player1: Player = {
                name: playerName,
                diffData: {
                    currentDifference: [],
                    differencesFound: 0,
                },
            };
            room.player1 = player1;
            room.clientGame.mode = GameModes.ClassicOneVsOne;
            return room;
        }
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
        const { originalDifferences } = room;
        const { diffData } = room.player1.playerId === socket.id ? room.player1 : room.player2;
        let index = 0;
        for (; index < originalDifferences.length; index++) {
            if (originalDifferences[index].some((coord: Coordinate) => coord.x === coords.x && coord.y === coords.y)) {
                diffData.differencesFound++;
                diffData.currentDifference = originalDifferences[index];
                break;
            }
        }

        if (index !== originalDifferences.length) {
            originalDifferences.splice(index, 1);
        } else {
            diffData.currentDifference = [];
        }

        this.rooms.set(room.roomId, room);
        const differencesData: Differences = {
            currentDifference: diffData.currentDifference,
            differencesFound: diffData.differencesFound,
        };
        server.to(room.roomId).emit(GameEvents.RemoveDiff, differencesData);
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

    deleteCreatedSoloGameRoom(roomId: string): void {
        this.rooms.delete(roomId);
    }

    endGame(roomId: string, server: io.Server): void {
        const room = this.rooms.get(roomId);
        if (room && room.clientGame.differencesCount === room.player1.diffData.differencesFound) {
            room.endMessage = `Vous avez trouvé les ${room.clientGame.differencesCount} différences! Bravo!`;
            this.roomAvailability.delete(room.clientGame.id);
            this.joinedPlayerNamesByGameId.delete(room.clientGame.id);
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

    getRoomByRoomId(roomId: string): ClassicPlayRoom {
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

    async createOneVsOneRoom(gameId: string): Promise<ClassicPlayRoom> {
        const oneVsOneGame = await this.createOneVsOneGame(gameId, 'Player 1');
        if (oneVsOneGame) {
            const roomId = this.generateRoomId();
            oneVsOneGame.roomId = roomId;
            this.rooms.set(oneVsOneGame.roomId, oneVsOneGame);
            return oneVsOneGame;
        }
    }

    getOneVsOneRoomByGameId(gameId: string): ClassicPlayRoom {
        return Array.from(this.rooms.values()).find((room) => room.clientGame.id === gameId && room.clientGame.mode === GameModes.ClassicOneVsOne);
    }

    deleteOneVsOneRoomAvailability(gameId: string, server: io.Server): void {
        if (this.roomAvailability.delete(gameId)) {
            this.checkRoomOneVsOneAvailability(gameId, server);
        }
    }

    saveRoom(room: ClassicPlayRoom): void {
        this.rooms.set(room.roomId, room);
    }

    updateWaitingPlayerNameList(gameId: string, playerName: string, server: io.Server): void {
        const playerNames = this.joinedPlayerNamesByGameId.get(gameId) ?? [];
        playerNames.push(playerName);
        this.joinedPlayerNamesByGameId.set(gameId, playerNames);
        const waitingPlayerNameList: WaitingPlayerNameList = { gameId, playerNamesList: playerNames };
        server.emit(GameEvents.UpdateWaitingPlayerNameList, waitingPlayerNameList);
    }

    getWaitingPlayerNameList(roomId: string): string[] {
        return this.joinedPlayerNamesByGameId.get(roomId);
    }

    refusePlayer(gameId: string, playerName: string, server: io.Server): void {
        this.cancelJoining(gameId, playerName, server);
    }

    acceptPlayer(gameId: string, roomId: string, playerNameCreator: string): string {
        const room = this.rooms.get(roomId);
        if (!room) return;

        const acceptedPlayerName = this.joinedPlayerNamesByGameId.get(gameId)?.[0];
        if (!acceptedPlayerName) return;
        const player2: Player = {
            name: acceptedPlayerName,
            diffData: {
                currentDifference: [],
                differencesFound: 0,
            },
        };
        room.player1.name = playerNameCreator;
        room.player2 = player2;
        this.rooms.set(roomId, room);
        this.joinedPlayerNamesByGameId.delete(gameId);
        this.roomAvailability.delete(gameId);
        return acceptedPlayerName;
    }

    checkIfPlayerNameIsAvailable(gameId: string, playerNames: string, server: io.Server): void {
        const joinedPlayerNames = this.joinedPlayerNamesByGameId.get(gameId);
        const playerNameAvailability: PlayerNameAvailability = {
            gameId,
            isNameAvailable: true,
        };
        playerNameAvailability.isNameAvailable = !joinedPlayerNames?.includes(playerNames);
        server.emit(GameEvents.PlayerNameTaken, playerNameAvailability);
    }

    cancelJoining(gameId: string, playerName: string, server: io.Server): void {
        const playerNames = this.joinedPlayerNamesByGameId.get(gameId);
        if (playerNames) {
            const index = playerNames.indexOf(playerName);
            if (index !== -1) {
                playerNames.splice(index, 1);
            }
            this.joinedPlayerNamesByGameId.set(gameId, playerNames);
            const waitingPlayerNameList: WaitingPlayerNameList = {
                gameId,
                playerNamesList: playerNames,
            };
            server.emit(GameEvents.UpdateWaitingPlayerNameList, waitingPlayerNameList);
        }
    }

    abandonGame(roomId: string, server: io.Server): void {
        const room = this.rooms.get(roomId);
        if (room) {
            room.endMessage = "L'adversaire a abandonné la partie!";
            server.to(room.roomId).emit(GameEvents.EndGame, room.endMessage);
            this.roomAvailability.delete(room.clientGame.id);
        }
    }
}
