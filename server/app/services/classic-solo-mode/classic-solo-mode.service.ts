import { GameService } from '@app/services/game/game.service';
import { Coordinate } from '@common/coordinate';
import { ClientSideGame, GameEvents, PlayRoom, ServerSideGame } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import * as io from 'socket.io';

@Injectable()
export class ClassicSoloModeService {
    private server: io.Server;
    private readonly rooms: Map<string, PlayRoom> = new Map<string, PlayRoom>();

    constructor(private readonly gameService: GameService) {}

    logServer(server: io.Server) {
        this.server = server;
    }

    createSoloRoom(socket: io.Socket, playerName: string, gameId: number): PlayRoom {
        const game = this.gameService.getGameById(gameId);
        const room: PlayRoom = {
            roomId: socket.id,
            serverGame: game,
            clientGame: this.buildClientGameVersion(playerName, game),
        };

        socket.join(room.roomId);
        this.rooms.set(room.roomId, room);
        return room;
    }

    updateTimer(roomId: string): void {
        const room = this.rooms.get(roomId);
        room.clientGame.timer++;
        this.server.to(room.roomId).emit(GameEvents.TimerStarted, room.clientGame.timer);
    }

    addPenalty(roomId: string): void {
        const room = this.rooms.get(roomId);
        room.clientGame.timer += room.clientGame.hintPenalty;
    }

    verifyCoords(roomId: string, coords: Coordinate): void {
        const room = this.rooms.get(roomId);
        const { serverGame } = room;
        let index = 0;
        for (; index < serverGame.differences.length; index++) {
            if (serverGame.differences[index].some((coord: Coordinate) => coord.x === coords.x && coord.y === coords.y)) {
                room.clientGame.differencesFound++;
                room.clientGame.currentDifference = serverGame.differences[index];
                break;
            }
        }

        if (index !== serverGame.differences.length) {
            serverGame.differences.splice(index, 1);
        } else {
            room.clientGame.currentDifference = [];
        }

        this.rooms.set(room.roomId, room);
        this.server.to(roomId).emit(GameEvents.RemoveDiff, room.clientGame);
    }

    buildClientGameVersion(playerName: string, game: ServerSideGame): ClientSideGame {
        const clientGame: ClientSideGame = {
            id: game.id,
            player: playerName,
            gameName: game.name,
            gameMode: 'Classic -> solo',
            timer: 0,
            differencesFound: 0,
            messages: [],
            endGameMessage: '',
            currentDifference: [],
            hintPenalty: this.gameService.getConfigConstants().penaltyTime,
            soloTopTime: game.soloTopTime,
            oneVsOneTopTime: game.oneVsOneTopTime,
            original: game.original,
            modified: game.modified,
            hintList: game.hintList,
        };
        return clientGame;
    }
    endGame(room: PlayRoom): void {
        if (room.serverGame.differencesCount === room.clientGame.differencesFound) {
            room.clientGame.endGameMessage = `Vous avez trouver les ${room.serverGame.differencesCount} différences! Bravo!`;
            this.server.to(room.roomId).emit(GameEvents.EndGame, room.clientGame.endGameMessage);
            this.rooms.delete(room.roomId);
        }
    }
}
