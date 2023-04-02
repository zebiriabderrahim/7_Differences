import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { LimitedModeService } from '@app/services/limited-mode/limited-mode.service';
import { PlayersListManagerService } from '@app/services/players-list-manager/players-list-manager.service';
import { RoomsManagerService } from '@app/services/rooms-manager/rooms-manager.service';
import { Coordinate } from '@common/coordinate';
import { GameCardEvents, GameEvents, MessageEvents, PlayerEvents, RoomEvents } from '@common/enums';
import { ChatMessage, playerData } from '@common/game-interfaces';
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
    // Services needed for this gateway
    // eslint-disable-next-line max-params
    constructor(
        private readonly logger: Logger,
        private readonly classicModeService: ClassicModeService,
        private readonly playersListManagerService: PlayersListManagerService,
        private readonly roomsManagerService: RoomsManagerService,
        private readonly limitedModeService: LimitedModeService,
    ) {}

    @SubscribeMessage(GameEvents.StartGameByRoomId)
    startGame(@ConnectedSocket() socket: Socket) {
        this.roomsManagerService.startGame(socket, this.server);
    }

    @SubscribeMessage(RoomEvents.CreateClassicSoloRoom)
    async createSoloRoom(@ConnectedSocket() socket: Socket, @MessageBody() playerPayLoad: playerData) {
        await this.classicModeService.createSoloRoom(socket, playerPayLoad, this.server);
    }

    @SubscribeMessage(RoomEvents.CreateOneVsOneRoom)
    async createOneVsOneRoom(@ConnectedSocket() socket: Socket, @MessageBody() playerPayLoad: playerData) {
        await this.classicModeService.createOneVsOneRoom(socket, playerPayLoad, this.server);
    }

    @SubscribeMessage(RoomEvents.CreateSoloLimitedRoom)
    async createSoloLimitedRoom(@ConnectedSocket() socket: Socket, @MessageBody() playerName: string) {
        await this.limitedModeService.createSoloLimitedRoom(socket, playerName, this.server);
    }

    @SubscribeMessage(RoomEvents.CreateCoopLimitedRoom)
    async createCoopLimitedRoom(@ConnectedSocket() socket: Socket, @MessageBody() playerPayLoad: playerData) {
        await this.limitedModeService.createOneVsOneLimitedRoom(socket, playerPayLoad, this.server);
    }

    @SubscribeMessage(GameEvents.StartNextGame)
    async startNextGame(@ConnectedSocket() socket: Socket) {
        await this.limitedModeService.startNextGame(socket, this.server);
    }

    @SubscribeMessage(GameEvents.RemoveDiff)
    validateCoords(@ConnectedSocket() socket: Socket, @MessageBody() coords: Coordinate) {
        this.roomsManagerService.verifyCoords(socket, coords, this.server);
    }

    @SubscribeMessage(GameEvents.CheckStatus)
    checkStatus(@ConnectedSocket() socket: Socket) {
        this.classicModeService.checkStatus(socket, this.server);
    }

    @SubscribeMessage(RoomEvents.UpdateRoomOneVsOneAvailability)
    updateRoomOneVsOneAvailability(@ConnectedSocket() socket: Socket, @MessageBody() gameId: string) {
        this.classicModeService.updateRoomOneVsOneAvailability(socket.id, gameId, this.server);
    }

    @SubscribeMessage(RoomEvents.CheckRoomOneVsOneAvailability)
    checkRoomOneVsOneAvailability(@ConnectedSocket() socket: Socket, @MessageBody() gameId: string) {
        this.classicModeService.checkRoomOneVsOneAvailability(socket.id, gameId, this.server);
    }

    @SubscribeMessage(RoomEvents.DeleteCreatedOneVsOneRoom)
    deleteCreatedOneVsOneRoom(@ConnectedSocket() socket: Socket, @MessageBody() roomId: string) {
        const gameId = this.roomsManagerService.getRoomById(roomId)?.clientGame.id;
        this.playersListManagerService.cancelAllJoining(gameId, this.server);
        this.classicModeService.deleteCreatedRoom(socket.id, roomId, this.server);
    }

    @SubscribeMessage(PlayerEvents.GetJoinedPlayerNames)
    getJoinedPlayerNames(@ConnectedSocket() socket: Socket, @MessageBody() gameId: string) {
        this.playersListManagerService.getWaitingPlayerNameList(socket.id, gameId, this.server);
    }

    @SubscribeMessage(PlayerEvents.UpdateWaitingPlayerNameList)
    updateWaitingPlayerNameList(@ConnectedSocket() socket: Socket, @MessageBody() playerPayLoad: playerData) {
        this.playersListManagerService.updateWaitingPlayerNameList(playerPayLoad, socket);
        const hostId = this.roomsManagerService.getHostIdByGameId(playerPayLoad.gameId);
        this.playersListManagerService.getWaitingPlayerNameList(hostId, playerPayLoad.gameId, this.server);
    }

    @SubscribeMessage(PlayerEvents.RefusePlayer)
    refusePlayer(@ConnectedSocket() socket: Socket, @MessageBody() playerPayLoad: playerData) {
        this.playersListManagerService.refusePlayer(playerPayLoad, this.server);
        this.playersListManagerService.getWaitingPlayerNameList(socket.id, playerPayLoad.gameId, this.server);
    }

    @SubscribeMessage(PlayerEvents.AcceptPlayer)
    acceptPlayer(@ConnectedSocket() socket: Socket, @MessageBody() data: { gameId: string; roomId: string; playerName: string }) {
        const acceptedPlayer = this.playersListManagerService.getAcceptPlayer(data.gameId, data.playerName, this.server);
        this.classicModeService.acceptPlayer(acceptedPlayer, data.roomId, this.server);
        this.classicModeService.updateRoomOneVsOneAvailability(socket.id, data.gameId, this.server);
        this.playersListManagerService.deleteJoinedPlayersByGameId(data.gameId);
    }

    @SubscribeMessage(PlayerEvents.CheckIfPlayerNameIsAvailable)
    checkIfPlayerNameIsAvailable(@MessageBody() playerPayLoad: playerData) {
        this.playersListManagerService.checkIfPlayerNameIsAvailable(playerPayLoad, this.server);
    }

    @SubscribeMessage(PlayerEvents.CancelJoining)
    cancelJoining(@ConnectedSocket() socket: Socket, @MessageBody() gameId: string) {
        this.playersListManagerService.cancelJoiningByPlayerId(socket.id, gameId);
        const hostId = this.roomsManagerService.getHostIdByGameId(gameId);
        this.playersListManagerService.getWaitingPlayerNameList(hostId, gameId, this.server);
    }

    @SubscribeMessage(GameEvents.AbandonGame)
    abandonGame(@ConnectedSocket() socket: Socket) {
        this.classicModeService.abandonGame(socket, this.server);
    }

    @SubscribeMessage(MessageEvents.LocalMessage)
    sendMessage(@ConnectedSocket() socket: Socket, @MessageBody() data: ChatMessage) {
        const roomId = this.roomsManagerService.getRoomIdFromSocket(socket);
        socket.broadcast.to(roomId).emit(MessageEvents.LocalMessage, data);
    }

    @SubscribeMessage(GameCardEvents.GameCardDeleted)
    gameCardDeleted(@MessageBody() gameId: string) {
        this.server.emit(GameCardEvents.RequestReload);
        this.server.emit(GameCardEvents.GameDeleted, gameId);
        this.limitedModeService.handleDeleteGame(gameId);
    }

    @SubscribeMessage(GameCardEvents.GameCardCreated)
    gameCardCreated() {
        this.server.emit(GameCardEvents.RequestReload);
    }

    @SubscribeMessage(GameCardEvents.ResetTopTime)
    resetTopTime(@MessageBody() gameId: string) {
        this.playersListManagerService.resetTopTime(gameId, this.server);
    }

    @SubscribeMessage(GameCardEvents.AllGamesDeleted)
    allGamesDeleted() {
        this.server.emit(GameCardEvents.RequestReload);
        this.limitedModeService.handleDeleteAllGame();
    }

    @SubscribeMessage(GameCardEvents.ResetAllTopTimes)
    resetAllTopTime() {
        this.playersListManagerService.resetAllTopTime(this.server);
    }

    @SubscribeMessage(GameCardEvents.GameConstantsUpdated)
    gameConstantsUpdated() {
        this.server.emit(GameCardEvents.RequestReload);
    }

    afterInit() {
        setInterval(() => {
            this.roomsManagerService.updateTimers(this.server);
        }, DELAY_BEFORE_EMITTING_TIME);
    }

    handleConnection(@ConnectedSocket() socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
    }

    handleDisconnect(@ConnectedSocket() socket: Socket) {
        this.logger.log(`Déconnexion par l'utilisateur avec id : ${socket.id}`);
        this.classicModeService.handleSocketDisconnect(socket, this.server);
    }
}
