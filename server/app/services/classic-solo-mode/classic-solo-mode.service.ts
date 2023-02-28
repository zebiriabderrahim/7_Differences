// Id comes from database to allow _id
/* eslint-disable no-underscore-dangle */
import { Game } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';
import { Coordinate } from '@common/coordinate';
import { ClientSideGame, Differences, GameEvents, PlayRoom } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as io from 'socket.io';

@Injectable()
export class ClassicSoloModeService {
    private rooms: Map<string, PlayRoom> = new Map<string, PlayRoom>();

    constructor(private readonly gameService: GameService) {}

    async createSoloRoom(socket: io.Socket, playerName: string, gameId: string): Promise<PlayRoom> {
        const game = await this.gameService.getGameById(gameId);
        const diffData: Differences = {
            currentDifference: [],
            differencesFound: 0,
        };
        const room: PlayRoom = {
            roomId: socket.id,
            clientGame: this.buildClientGameVersion(playerName, game),
            timer: 0,
            endMessage: '',
            differencesData: diffData,
            originalDifferences: structuredClone(JSON.parse(fs.readFileSync(`assets/${game.name}/differences.json`, 'utf-8'))),
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
            mode: 'Classic -> solo',
            original: 'data:image/png;base64,'.concat(fs.readFileSync(`assets/${game.name}/original.bmp`, 'base64')),
            modified: 'data:image/png;base64,'.concat(fs.readFileSync(`assets/${game.name}/modified.bmp`, 'base64')),
            isHard: game.isHard,
            differencesCount: game.nDifference,
        };
        return clientGame;
    }
    endGame(roomId: string, server: io.Server): void {
        const room = this.rooms.get(roomId);
        if (room && room.clientGame.differencesCount === room.differencesData.differencesFound) {
            room.endMessage = `Vous avez trouvé les ${room.clientGame.differencesCount} différences! Bravo!`;
            server.to(room.roomId).emit(GameEvents.EndGame, room.endMessage);
            this.rooms.delete(room.roomId);
        }
    }
}
