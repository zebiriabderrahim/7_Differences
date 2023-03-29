import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { PlayersListManagerService } from '@app/services/players-list-manager/players-list-manager.service';
import { Coordinate } from '@common/coordinate';
import { ChatMessage, GameEvents, GameModes, MessageEvents, playerData } from '@common/game-interfaces';
import { Injectable, Logger } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DELAY_BEFORE_EMITTING_TIME } from './game.gateway.constants';

@WebSocketGateway(
    WebSocketGateway({
        cors: {
            origin: '*',
        },
    }),
)
@Injectable()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;

    constructor(
        private readonly logger: Logger,
        private readonly classicModeService: ClassicModeService,
        private readonly playersListManagerService: PlayersListManagerService,
    ) {}

    @SubscribeMessage(GameEvents.StartGameByRoomId)
    startGame(@ConnectedSocket() socket: Socket) {
        this.classicModeService.startGame(socket, this.server);
    }

    @SubscribeMessage(GameEvents.CreateSoloGame)
    async createSoloRoom(@ConnectedSocket() socket: Socket, @MessageBody() playerPayLoad: playerData) {
        await this.classicModeService.createSoloRoom(socket, playerPayLoad, this.server);
    }

    @SubscribeMessage(GameEvents.CreateOneVsOneRoom)
    async createOneVsOneRoom(@ConnectedSocket() socket: Socket, @MessageBody() playerPayLoad: playerData) {
        await this.classicModeService.createOneVsOneRoom(socket, playerPayLoad, this.server);
    }

    @SubscribeMessage(GameEvents.RemoveDiff)
    validateCoords(@ConnectedSocket() socket: Socket, @MessageBody() coords: Coordinate) {
        this.classicModeService.verifyCoords(socket, coords, this.server);
    }

    @SubscribeMessage(GameEvents.CheckStatus)
    checkStatus(@ConnectedSocket() socket: Socket) {
        this.classicModeService.endGame(socket, this.server);
    }

    @SubscribeMessage(GameEvents.UpdateRoomOneVsOneAvailability)
    updateRoomOneVsOneAvailability(@ConnectedSocket() socket: Socket, @MessageBody() gameId: string) {
        this.classicModeService.updateRoomOneVsOneAvailability(socket.id, gameId, this.server);
    }

    @SubscribeMessage(GameEvents.CheckRoomOneVsOneAvailability)
    checkRoomOneVsOneAvailability(@ConnectedSocket() socket: Socket, @MessageBody() gameId: string) {
        this.classicModeService.checkRoomOneVsOneAvailability(socket.id, gameId, this.server);
    }

    @SubscribeMessage(GameEvents.DeleteCreatedOneVsOneRoom)
    deleteCreatedOneVsOneRoom(@ConnectedSocket() socket: Socket, @MessageBody() roomId: string) {
        const gameId = this.classicModeService.getRoomById(roomId)?.clientGame.id;
        this.playersListManagerService.cancelAllJoining(gameId, this.server);
        this.classicModeService.deleteCreatedRoom(socket.id, roomId, this.server);
    }

    @SubscribeMessage(GameEvents.GetJoinedPlayerNames)
    getJoinedPlayerNames(@ConnectedSocket() socket: Socket, @MessageBody() gameId: string) {
        this.playersListManagerService.getWaitingPlayerNameList(socket.id, gameId, this.server);
    }

    @SubscribeMessage(GameEvents.UpdateWaitingPlayerNameList)
    updateWaitingPlayerNameList(@ConnectedSocket() socket: Socket, @MessageBody() playerPayLoad: playerData) {
        this.playersListManagerService.updateWaitingPlayerNameList(playerPayLoad, socket);
        const hostId = this.classicModeService.getHostIdByGameId(playerPayLoad.gameId);
        this.playersListManagerService.getWaitingPlayerNameList(hostId, playerPayLoad.gameId, this.server);
    }

    @SubscribeMessage(GameEvents.RefusePlayer)
    refusePlayer(@ConnectedSocket() socket: Socket, @MessageBody() playerPayLoad: playerData) {
        this.playersListManagerService.refusePlayer(playerPayLoad, this.server);
        this.playersListManagerService.getWaitingPlayerNameList(socket.id, playerPayLoad.gameId, this.server);
    }

    @SubscribeMessage(GameEvents.AcceptPlayer)
    acceptPlayer(@ConnectedSocket() socket: Socket, @MessageBody() data: { gameId: string; roomId: string; playerName: string }) {
        const acceptedPlayer = this.playersListManagerService.getAcceptPlayer(data.gameId, data.playerName, this.server);
        this.classicModeService.acceptPlayer(acceptedPlayer, data.roomId, this.server);
        this.classicModeService.updateRoomOneVsOneAvailability(socket.id, data.gameId, this.server);
        this.playersListManagerService.deleteJoinedPlayersByGameId(data.gameId);
    }

    @SubscribeMessage(GameEvents.CheckIfPlayerNameIsAvailable)
    checkIfPlayerNameIsAvailable(@MessageBody() playerPayLoad: playerData) {
        this.playersListManagerService.checkIfPlayerNameIsAvailable(playerPayLoad, this.server);
    }

    @SubscribeMessage(GameEvents.CancelJoining)
    cancelJoining(@ConnectedSocket() socket: Socket, @MessageBody() gameId: string) {
        this.playersListManagerService.cancelJoiningByPlayerId(socket.id, gameId);
        const hostId = this.classicModeService.getHostIdByGameId(gameId);
        this.playersListManagerService.getWaitingPlayerNameList(hostId, gameId, this.server);
    }

    @SubscribeMessage(GameEvents.AbandonGame)
    abandonGame(@ConnectedSocket() socket: Socket) {
        this.classicModeService.abandonGame(socket, this.server);
    }

    @SubscribeMessage(MessageEvents.LocalMessage)
    sendMessage(@ConnectedSocket() socket: Socket, @MessageBody() data: ChatMessage) {
        const roomId = this.classicModeService.getRoomIdFromSocket(socket);
        socket.broadcast.to(roomId).emit(MessageEvents.LocalMessage, data);
    }

    @SubscribeMessage(GameEvents.DeleteGameCard)
    gameCardDeleted(@MessageBody() gameId: string) {
        this.server.emit(GameEvents.RequestGameCardsUpdate);
        this.server.emit(GameEvents.GameCardDeleted, gameId);
    }

    @SubscribeMessage(GameEvents.GameCardCreated)
    gameCardCreated() {
        this.server.emit(GameEvents.RequestGameCardsUpdate);
    }

    afterInit() {
        setInterval(() => {
            this.updateTimers();
        }, DELAY_BEFORE_EMITTING_TIME);
    }

    handleConnection(@ConnectedSocket() socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
    }

    handleDisconnect(@ConnectedSocket() socket: Socket) {
        this.logger.log(`Déconnexion par l'utilisateur avec id : ${socket.id}`);
        this.classicModeService.handleSocketDisconnect(socket, this.server);
    }

    updateTimers() {
        for (const roomId of this.classicModeService['rooms'].keys()) {
            const room = this.classicModeService.getRoomById(roomId);
            if ((room.player2 && room.clientGame.mode === GameModes.ClassicOneVsOne) || room.clientGame.mode === GameModes.ClassicSolo)
                this.classicModeService.updateTimer(roomId, this.server);
        }
    }
}
