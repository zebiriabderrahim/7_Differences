// -1 for index of non existing element
/* eslint-disable @typescript-eslint/no-magic-numbers */
// Id comes from database to allow _id
/* eslint-disable no-underscore-dangle */
import { Game } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';
import { MessageManagerService } from '@app/services/message-manager/message-manager.service';
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
    private joinedPlayerNamesByGameId: Map<string, Player[]>;
    private roomAvailability: Map<string, RoomAvailability>;

    constructor(private readonly gameService: GameService, private readonly messageManager: MessageManagerService) {
        this.rooms = new Map<string, ClassicPlayRoom>();
        this.joinedPlayerNamesByGameId = new Map<string, Player[]>();
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
        if (!room) return;
        const { originalDifferences } = room;
        const { diffData } = room.player1.playerId === socket.id ? room.player1 : room.player2;
        const playerName = room.player1.playerId === socket.id ? room.player1.name : room.player2.name;
        let index = 0;
        let localMessage: ChatMessage;
        for (; index < originalDifferences.length; index++) {
            if (originalDifferences[index].some((coord: Coordinate) => coord.x === coords.x && coord.y === coords.y)) {
                diffData.differencesFound++;
                diffData.currentDifference = originalDifferences[index];
                break;
            }
        }
        if (index !== originalDifferences.length) {
            originalDifferences.splice(index, 1);
            localMessage = this.messageManager.getLocalMessage(room.clientGame.mode, true, playerName);
            server.to(room.roomId).emit(MessageEvents.LocalMessage, localMessage);
        } else {
            diffData.currentDifference = [];
            localMessage = this.messageManager.getLocalMessage(room.clientGame.mode, false, playerName);
            server.to(room.roomId).emit(MessageEvents.LocalMessage, localMessage);
        }
        this.rooms.set(room.roomId, room);
        const differencesData: Differences = {
            currentDifference: diffData.currentDifference,
            differencesFound: diffData.differencesFound,
        };
        server
            .to(room.roomId)
            .emit(GameEvents.RemoveDiff, { differencesData, playerId: socket.id, cheatDifferences: room.originalDifferences.flat() });
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
        const gameId = this.rooms.get(roomId).clientGame.id;
        this.updateRoomOneVsOneAvailability(gameId, server);
        this.rooms.delete(roomId);
    }

    endGame(socket: io.Socket, server: io.Server): void {
        const roomId = this.getRoomIdFromSocket(socket);
        const room = this.getRoomByRoomId(roomId);
        if (!room) return;
        const player: Player = room.player1.playerId === socket.id ? room.player1 : room.player2;
        if (room && room.clientGame.differencesCount === player.diffData.differencesFound && room.clientGame.mode === GameModes.ClassicSolo) {
            room.endMessage = `Vous avez trouvé les ${room.clientGame.differencesCount} différences! Bravo!`;
            server.to(roomId).emit(GameEvents.EndGame, room.endMessage);
            this.rooms.delete(roomId);
            this.joinedPlayerNamesByGameId.delete(room.clientGame.id);
        } else if (
            room &&
            Math.ceil(room.clientGame.differencesCount / 2) === player.diffData.differencesFound &&
            room.clientGame.mode === GameModes.ClassicOneVsOne
        ) {
            room.endMessage = `${player.name} remporte la partie avec ${player.diffData.differencesFound} différences trouvées!`;
            server.to(roomId).emit(GameEvents.EndGame, room.endMessage);
            this.rooms.delete(roomId);
            this.joinedPlayerNamesByGameId.delete(room.clientGame.id);
        }
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

    saveRoom(room: ClassicPlayRoom): void {
        this.rooms.set(room.roomId, room);
    }

    updateWaitingPlayerNameList(gameId: string, playerName: string, socket: io.Socket): void {
        const playerNames = this.joinedPlayerNamesByGameId.get(gameId) ?? [];
        const diffData: Differences = {
            currentDifference: [],
            differencesFound: 0,
        };
        const playerGuest: Player = {
            name: playerName,
            diffData,
            playerId: socket.id,
        };
        playerNames.push(playerGuest);
        this.joinedPlayerNamesByGameId.set(gameId, playerNames);
    }

    getWaitingPlayerNameList(gameId: string): string[] {
        return Array.from(this.joinedPlayerNamesByGameId.get(gameId) ?? []).map((player) => player.name);
    }

    refusePlayer(gameId: string, playerName: string, server: io.Server): void {
        this.cancelJoining(gameId, playerName, server);
    }

    acceptPlayer(gameId: string, roomId: string, playerNameCreator: string): string {
        const room = this.rooms.get(roomId);
        if (!room) return;

        const acceptedPlayer = this.joinedPlayerNamesByGameId.get(gameId)?.[0];
        if (!acceptedPlayer) return;
        const player2: Player = {
            name: acceptedPlayer.name,
            diffData: {
                currentDifference: [],
                differencesFound: 0,
            },
        };
        room.player1.name = playerNameCreator;
        room.player2 = player2;
        this.rooms.set(roomId, room);
        this.joinedPlayerNamesByGameId.delete(gameId);
        return acceptedPlayer.name;
    }

    checkIfPlayerNameIsAvailable(gameId: string, playerNames: string, server: io.Server): void {
        const joinedPlayerNames = this.joinedPlayerNamesByGameId.get(gameId);
        const playerNameAvailability: PlayerNameAvailability = {
            gameId,
            isNameAvailable: true,
        };
        playerNameAvailability.isNameAvailable = !joinedPlayerNames?.some((player) => player.name === playerNames);
        server.emit(GameEvents.PlayerNameTaken, playerNameAvailability);
    }

    cancelJoining(gameId: string, playerName: string, server: io.Server): void {
        const playerNames = this.joinedPlayerNamesByGameId.get(gameId);
        if (playerNames) {
            const index = playerNames.indexOf(playerNames.find((player) => player.name === playerName));
            if (index !== -1) {
                playerNames.splice(index, 1);
            }
            this.joinedPlayerNamesByGameId.set(gameId, playerNames);
            const waitingPlayerNameList: WaitingPlayerNameList = {
                gameId,
                playerNamesList: playerNames.map((player) => player.name),
            };
            server.emit(GameEvents.UpdateWaitingPlayerNameList, waitingPlayerNameList);
        }
    }

    cancelAllJoining(gameId: string, server: io.Server): void {
        structuredClone(this.joinedPlayerNamesByGameId.get(gameId))?.forEach((player: Player) => {
            this.cancelJoining(gameId, player.name, server);
        });
    }

    getGameIdByPlayerId(playerId: string): string {
        return Array.from(this.joinedPlayerNamesByGameId.keys()).find((gameId) =>
            this.joinedPlayerNamesByGameId.get(gameId).some((player) => player.playerId === playerId),
        );
    }

    getRoomIdByPlayerId(playerId: string): string {
        return Array.from(this.rooms.keys()).find((roomId) => {
            const room = this.rooms.get(roomId);
            return room.player1?.playerId === playerId || room.player2?.playerId === playerId;
        });
    }

    deleteJoinedPlayerById(playerId: string, server: io.Server): void {
        const gameId = this.getGameIdByPlayerId(playerId);
        if (!gameId) return;
        const playerNames = this.joinedPlayerNamesByGameId.get(gameId);
        const playerIndex = playerNames.findIndex((player) => player.playerId === playerId);
        if (playerIndex === -1) return;
        const [, ...newPlayerNames] = playerNames.splice(playerIndex);
        this.joinedPlayerNamesByGameId.set(gameId, newPlayerNames);
        const waitingPlayerNameList: WaitingPlayerNameList = {
            gameId,
            playerNamesList: newPlayerNames.map(({ name }) => name),
        };
        server.emit(GameEvents.UpdateWaitingPlayerNameList, waitingPlayerNameList);
    }

    abandonGame(socket: io.Socket, server: io.Server): void {
        const roomId = this.getRoomIdByPlayerId(socket.id);
        const room = this.getRoomByRoomId(roomId);
        if (room && room.clientGame.mode === GameModes.ClassicOneVsOne) {
            const player: Player = room.player1.playerId === socket.id ? room.player1 : room.player2;
            room.endMessage = "L'adversaire a abandonné la partie!";
            const localMessage: ChatMessage = this.messageManager.getQuitMessage(player.name);
            server.to(room.roomId).emit(MessageEvents.LocalMessage, localMessage);
            this.deleteCreatedRoom(roomId, server);
            this.deleteOneVsOneRoomAvailability(room.clientGame.id, server);
            server.to(room.roomId).emit(GameEvents.EndGame, room.endMessage);
        }
    }

    handleSocketDisconnect(socket: io.Socket, server: io.Server): void {
        const roomId = this.getRoomIdByPlayerId(socket.id);
        const room = this.getRoomByRoomId(roomId);
        const joinable = this.roomAvailability.get(room?.clientGame.id)?.isAvailableToJoin;
        if (room && !room.player2 && joinable && room.clientGame.mode === GameModes.ClassicOneVsOne) {
            this.deleteOneVsOneRoomAvailability(room.clientGame.id, server);
            this.cancelAllJoining(room.clientGame.id, server);
        } else if (room && room.timer !== 0 && !joinable) {
            this.abandonGame(socket, server);
        } else {
            this.deleteJoinedPlayerById(socket.id, server);
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
}
