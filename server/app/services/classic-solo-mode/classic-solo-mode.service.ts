import { GameService } from '@app/services/game/game.service';
import { Coordinate } from '@common/coordinate';
import { ClientSideGame, Differences, GameEvents, PlayRoom, ServerSideGame } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import * as io from 'socket.io';

@Injectable()
export class ClassicSoloModeService {
    rooms: Map<string, PlayRoom> = new Map<string, PlayRoom>();

    constructor(private readonly gameService: GameService) {}

    createSoloRoom(socket: io.Socket, playerName: string, gameId: string): PlayRoom {
        const game = this.gameService.getGameById(gameId);
        const diffData: Differences = {
            currentDifference: [],
            differencesFound: 0,
        };
        const room: PlayRoom = {
            roomId: socket.id,
            serverGame: structuredClone(game),
            clientGame: this.buildClientGameVersion(playerName, game),
            timer: 0,
            endMessage: '',
            differencesData: diffData,
        };
        this.rooms.set(room.roomId, room);
        socket.join(room.roomId);
        return room;
    }

    updateTimer(roomId: string, server: io.Server): void {
        const room = this.rooms.get(roomId);
        if (room) {
            room.timer++;
            server.to(room.roomId).emit(GameEvents.TimerStarted, room.timer);
        }
    }

    verifyCoords(roomId: string, coords: Coordinate, server: io.Server): void {
        const room = this.rooms.get(roomId);
        const { serverGame } = room;
        let index = 0;
        for (; index < serverGame.differences.length; index++) {
            if (serverGame.differences[index].some((coord: Coordinate) => coord.x === coords.x && coord.y === coords.y)) {
                room.differencesData.differencesFound++;
                room.differencesData.currentDifference = serverGame.differences[index];
                break;
            }
        }

        if (index !== serverGame.differences.length) {
            serverGame.differences.splice(index, 1);
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

    buildClientGameVersion(playerName: string, game: ServerSideGame): ClientSideGame {
        const clientGame: ClientSideGame = {
            id: game.id,
            player: playerName,
            name: game.name,
            mode: 'Classic -> solo',
            original: game.original,
            modified: game.modified,
            isHard: game.isHard,
            differencesCount: game.differencesCount,
        };
        return clientGame;
    }
    endGame(roomId: string, server: io.Server): void {
        const room = this.rooms.get(roomId);
        if (room && room.serverGame.differencesCount === room.differencesData.differencesFound) {
            room.endMessage = `Vous avez trouvé les ${room.serverGame.differencesCount} différences! Bravo!`;
            server.to(room.roomId).emit(GameEvents.EndGame, room.endMessage);
            this.rooms.delete(room.roomId);
        }
    }
}
