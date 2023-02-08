import { GameService } from '@app/services/game/game.service';
import { Coordinate } from '@common/coordinate';
import { ClientSideGame, GameEvents, PlayRoom, ServerSideGame } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import console from 'console';
import * as io from 'socket.io';

@Injectable()
export class ClassicSoloModeService {
    rooms: Map<string, PlayRoom> = new Map<string, PlayRoom>();

    constructor(private readonly gameService: GameService) {}

    createSoloRoom(socket: io.Socket, playerName: string, gameId: number): PlayRoom {
        const game = this.gameService.getGameById(gameId);
        const clientGame = this.buildClientGameVersion(playerName, game);
        const room: PlayRoom = {
            roomId: socket.id,
            serverGame: game,
            clientGame,
        };
        this.rooms.set(room.roomId, room);
        return room;
    }

    updateTimer(roomId: string, server: io.Server): void {
        const room = this.rooms.get(roomId);
        if (room) {
            room.clientGame.timer++;
            server.to(room.roomId).emit(GameEvents.TimerStarted, room.clientGame.timer);
        }
    }

    verifyCoords(roomId: string, coords: Coordinate, server: io.Server): void {
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
        server.to(room.roomId).emit(GameEvents.RemoveDiff, room.clientGame);
    }

    buildClientGameVersion(playerName: string, game: ServerSideGame): ClientSideGame {
        const clientGame: ClientSideGame = {
            id: game.id,
            player: playerName,
            name: game.name,
            mode: 'Classic -> solo',
            timer: 0,
            differencesFound: 0,
            endMessage: '',
            currentDifference: [],
            original: game.original,
            modified: game.modified,
            isHard: game.isHard,
            differencesCount: game.differencesCount,
        };
        return clientGame;
    }
    endGame(room: PlayRoom, server: io.Server): void {
        if (room.serverGame.differencesCount === room.clientGame.differencesFound) {
            room.clientGame.endMessage = `Vous avez trouver les ${room.serverGame.differencesCount} différences! Bravo!`;
            server.to(room.roomId).emit(GameEvents.EndGame, room.clientGame.endMessage);
            this.rooms.delete(room.roomId);
        }
    }
}
