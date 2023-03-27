/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Differences, GameEvents, Player, PlayerNameAvailability } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import * as io from 'socket.io';

@Injectable()
export class PlayersListManagerService {
    private joinedPlayersByGameId: Map<string, Player[]>;

    constructor() {
        this.joinedPlayersByGameId = new Map<string, Player[]>();
    }

    updateWaitingPlayerNameList(gameId: string, playerName: string, socket: io.Socket): void {
        const playerNames = this.joinedPlayersByGameId.get(gameId) ?? [];
        const diffData = { currentDifference: [], differencesFound: 0 } as Differences;
        const playerGuest = { name: playerName, diffData, playerId: socket.id } as Player;
        playerNames.push(playerGuest);
        this.joinedPlayersByGameId.set(gameId, playerNames);
    }

    getWaitingPlayerNameList(hostId: string, gameId: string, server: io.Server): void {
        const playerNamesList = Array.from(this.joinedPlayersByGameId.get(gameId) ?? []).map((player) => player.name);
        server.to(hostId).emit(GameEvents.WaitingPlayerNameListUpdated, playerNamesList);
    }

    refusePlayer(playerName: string, gameId: string, server: io.Server): void {
        this.cancelJoiningByPlayerName(playerName, gameId, server);
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

    checkIfPlayerNameIsAvailable(gameId: string, playerNames: string, server: io.Server): void {
        const joinedPlayerNames = this.joinedPlayersByGameId.get(gameId);
        const playerNameAvailability = { gameId, isNameAvailable: true } as PlayerNameAvailability;
        playerNameAvailability.isNameAvailable = !joinedPlayerNames?.some((player) => player.name === playerNames);
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

    deleteJoinedPlayerByPlayerId(playerId: string): string {
        const gameId = this.getGameIdByPlayerId(playerId);
        if (!gameId) return;
        const playerNames = this.joinedPlayersByGameId.get(gameId);
        const playerIndex = playerNames.findIndex((player) => player.playerId === playerId);
        if (playerIndex === -1) return;
        playerNames.splice(playerIndex, 1);
        this.joinedPlayersByGameId.set(gameId, playerNames);
        return gameId;
    }

    deleteJoinedPlayersByGameId(gameId: string): void {
        this.joinedPlayersByGameId.delete(gameId);
    }
}
