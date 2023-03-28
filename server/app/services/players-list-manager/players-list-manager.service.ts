/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ClassicPlayRoom, Differences, GameEvents, Player, playerData, PlayerNameAvailability, PlayerTime } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import * as io from 'socket.io';
import { GameService } from '@app/services/game/game.service';

@Injectable()
export class PlayersListManagerService {
    private joinedPlayersByGameId: Map<string, Player[]>;

    constructor(private readonly gameService: GameService) {
        this.joinedPlayersByGameId = new Map<string, Player[]>();
    }

    updateWaitingPlayerNameList(playerPayLoad: playerData, socket: io.Socket): void {
        const playerNames = this.joinedPlayersByGameId.get(playerPayLoad.gameId) ?? [];
        const diffData = { currentDifference: [], differencesFound: 0 } as Differences;
        const playerGuest = { name: playerPayLoad.playerName, diffData, playerId: socket.id } as Player;
        playerNames.push(playerGuest);
        this.joinedPlayersByGameId.set(playerPayLoad.gameId, playerNames);
    }

    getWaitingPlayerNameList(hostId: string, gameId: string, server: io.Server): void {
        const playerNamesList = Array.from(this.joinedPlayersByGameId.get(gameId) ?? []).map((player) => player.name);
        server.to(hostId).emit(GameEvents.WaitingPlayerNameListUpdated, playerNamesList);
    }

    refusePlayer(playerPayLoad: playerData, server: io.Server): void {
        this.cancelJoiningByPlayerName(playerPayLoad.playerName, playerPayLoad.gameId, server);
    }

    getAcceptPlayer(gameId: string, playerName: string, server: io.Server): Player {
        this.joinedPlayersByGameId.get(gameId)?.forEach((player) => {
            if (player.name !== playerName) {
                this.cancelJoiningByPlayerName(player.name, gameId, server);
            }
        });
        const acceptedPlayer = this.joinedPlayersByGameId.get(gameId)?.[0];
        if (!acceptedPlayer) return;
        return acceptedPlayer;
    }

    checkIfPlayerNameIsAvailable(playerPayLoad: playerData, server: io.Server): void {
        const joinedPlayerNames = this.joinedPlayersByGameId.get(playerPayLoad.gameId);
        const playerNameAvailability = { gameId: playerPayLoad.gameId, isNameAvailable: true } as PlayerNameAvailability;
        playerNameAvailability.isNameAvailable = !joinedPlayerNames?.some((player) => player.name === playerPayLoad.playerName);
        server.emit(GameEvents.PlayerNameTaken, playerNameAvailability);
    }

    cancelJoiningByPlayerName(playerName: string, gameId: string, server: io.Server): void {
        const playerId = this.getPlayerIdByPlayerName(gameId, playerName);
        if (playerId) {
            this.cancelJoiningByPlayerId(playerId, gameId);
            server.to(playerId).emit(GameEvents.PlayerRefused, playerId);
            server.emit(GameEvents.UndoCreation, gameId);
        }
    }

    cancelJoiningByPlayerId(playerId: string, gameId: string): void {
        const playerNames = this.joinedPlayersByGameId.get(gameId);
        if (playerNames) {
            const index = playerNames.indexOf(playerNames.find((player) => player.playerId === playerId));
            if (index !== -1) {
                playerNames.splice(index, 1);
            }
            this.joinedPlayersByGameId.set(gameId, playerNames);
        }
    }

    cancelAllJoining(gameId: string, server: io.Server): void {
        structuredClone(this.joinedPlayersByGameId.get(gameId))?.forEach((player: Player) => {
            this.cancelJoiningByPlayerName(player.name, gameId, server);
        });
    }

    getPlayerIdByPlayerName(gameId: string, playerName: string): string {
        return this.joinedPlayersByGameId.get(gameId)?.find((player) => player.name === playerName)?.playerId;
    }

    getGameIdByPlayerId(playerId: string): string {
        return Array.from(this.joinedPlayersByGameId.keys()).find((gameId) =>
            this.joinedPlayersByGameId.get(gameId).some((player) => player.playerId === playerId),
        );
    }

    deleteJoinedPlayerByPlayerId(playerId: string, gameId: string) {
        const playerNames = this.joinedPlayersByGameId?.get(gameId);
        const playerIndex = playerNames.findIndex((player) => player.playerId === playerId);
        if (playerIndex === -1) return;
        playerNames.splice(playerIndex, 1);
        this.joinedPlayersByGameId.set(gameId, playerNames);
    }

    deleteJoinedPlayersByGameId(gameId: string): void {
        this.joinedPlayersByGameId.delete(gameId);
    }

    async updateTopBestTime(room: ClassicPlayRoom, playerName: string): Promise<void> {
        const { clientGame, timer } = room;
        const topTimes = await this.gameService.getTopTimesGameById(clientGame.id, clientGame.mode);
        if (topTimes[2].time > timer) {
            const newTopTime = { name: playerName, time: timer } as PlayerTime;
            topTimes.splice(2, 1, newTopTime);
            topTimes.sort((a, b) => a.time - b.time);
            await this.gameService.updateTopTimesGameById(clientGame.id, clientGame.mode, topTimes);
        }
    }
}
