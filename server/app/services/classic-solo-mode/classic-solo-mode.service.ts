import { ClientSideGame, PlayRoom, ServerSideGame } from '@common/game-interfaces';
import { GameService } from '@app/services/game/game.service';
import { Coordinate } from '@common/coordinate';
import { Injectable } from '@nestjs/common';
import * as io from 'socket.io';
import { GameEvents } from '@app/gateways/game/game.gateway.events';

@Injectable()
export class ClassicSoloModeService {
    private readonly server: io.Server;
    private readonly rooms: Map<string, PlayRoom> = new Map<string, PlayRoom>();

    constructor(private readonly gameService: GameService) {}

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
                room.clientGame.currentDifference = serverGame.differencesCount[index];
                break;
            }
        }

        if (index !== serverGame.differences.length) {
            serverGame.differences.splice(index, 1);
        } else {
            room.clientGame.currentDifference = [];
        }
        this.rooms.set(room.roomId, room);
        this.server.to(room.roomId).emit(GameEvents.RemoveDiff, room);
    }

    buildClientGameVersion(playerName: string, gameInfo: ServerSideGame): ClientSideGame {
        const clientGame: ClientSideGame = {
            id: gameInfo.id,
            player: playerName,
            gameName: gameInfo.name,
            gameMode: 'Classic -> solo',
            timer: 0,
            differencesFound: 0,
            messages: [],
            endGameMessage: '',
            currentDifference: [],
            hintPenalty: this.gameService.getConfigConstants().penaltyTime,
            soloTopTime: gameInfo.soloTopTime,
            oneVsOneTopTime: gameInfo.oneVsOneTopTime,
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
