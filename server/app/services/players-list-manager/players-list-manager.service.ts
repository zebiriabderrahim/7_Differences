/* eslint-disable @typescript-eslint/no-magic-numbers */
import { GameService } from '@app/services/game/game.service';
import { MAX_TIMES_INDEX, NOT_FOUND } from '@common/constants';
import { ClassicPlayRoom, Differences, NewRecord, Player, playerData, PlayerNameAvailability, PlayerTime } from '@common/game-interfaces';
import { GameCardEvents, GameEvents, MessageEvents, PlayerEvents, RoomEvents } from '@common/enums';
import { Injectable } from '@nestjs/common';
import * as io from 'socket.io';
import { MessageManagerService } from '@app/services/message-manager/message-manager.service';

@Injectable()
export class PlayersListManagerService {
    private joinedPlayersByGameId: Map<string, Player[]>;

    constructor(private readonly gameService: GameService, private readonly messageManagerService: MessageManagerService) {
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
        server.emit(PlayerEvents.PlayerNameTaken, playerNameAvailability);
    }

    cancelJoiningByPlayerName(playerName: string, gameId: string, server: io.Server): void {
        const playerId = this.getPlayerIdByPlayerName(gameId, playerName);
        if (playerId) {
            this.cancelJoiningByPlayerId(playerId, gameId);
            server.to(playerId).emit(PlayerEvents.PlayerRefused, playerId);
            server.emit(RoomEvents.UndoCreation, gameId);
        }
    }

    cancelJoiningByPlayerId(playerId: string, gameId: string): void {
        const playerNames = this.joinedPlayersByGameId.get(gameId);
        if (playerNames) {
            const index = playerNames.indexOf(playerNames.find((player) => player.playerId === playerId));
            if (index !== NOT_FOUND) {
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
        if (playerIndex === NOT_FOUND) return;
        playerNames.splice(playerIndex, 1);
        this.joinedPlayersByGameId.set(gameId, playerNames);
    }

    deleteJoinedPlayersByGameId(gameId: string): void {
        this.joinedPlayersByGameId.delete(gameId);
    }

    async updateTopBestTime(room: ClassicPlayRoom, playerName: string, server: io.Server): Promise<number> {
        const { clientGame, timer } = room;
        const topTimes = await this.gameService.getTopTimesGameById(clientGame.id, clientGame.mode);
        if (topTimes[MAX_TIMES_INDEX].time > timer) {
            const topTimeIndex = this.insertNewTopTime(playerName, timer, topTimes);
            await this.gameService.updateTopTimesGameById(clientGame.id, clientGame.mode, topTimes);
            server.emit(GameCardEvents.RequestReload);
            const newRecord = { playerName, rank: topTimeIndex, gameName: clientGame.name, gameMode: clientGame.mode } as NewRecord;
            this.sendNewTopTimeMessage(newRecord, server);
            return topTimeIndex;
        }
    }

    insertNewTopTime(playerName: string, timer: number, topTimes: PlayerTime[]): number {
        const newTopTime = { name: playerName, time: timer } as PlayerTime;
        topTimes.splice(MAX_TIMES_INDEX, 1, newTopTime);
        topTimes.sort((a, b) => a.time - b.time);
        return topTimes.findIndex((topTime) => topTime.name === playerName) + 1;
    }

    sendNewTopTimeMessage(newRecord: NewRecord, server: io.Server): void {
        const newRecordMessage = this.messageManagerService.getNewRecordMessage(newRecord);
        server.emit(MessageEvents.LocalMessage, newRecordMessage);
    }

    async resetTopTime(gameId: string, server: io.Server): Promise<void> {
        await this.gameService.resetTopTimesGameById(gameId);
        server.emit(GameCardEvents.RequestReload);
    }

    async resetAllTopTime(server: io.Server): Promise<void> {
        await this.gameService.resetAllTopTimes();
        server.emit(GameCardEvents.RequestReload);
    }
}
