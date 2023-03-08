import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { Coordinate } from '@common/coordinate';
import { GameEvents, GameModes } from '@common/game-interfaces';
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

    constructor(private readonly logger: Logger, private readonly classicModeService: ClassicModeService) {}

    @SubscribeMessage(GameEvents.CreateSoloGame)
    async createSoloGame(@ConnectedSocket() socket: Socket, @MessageBody('player') playerName: string, @MessageBody('gameId') gameId: string) {
        const room = await this.classicModeService.createRoom(playerName, gameId);
        if (room) {
            room.clientGame.mode = GameModes.ClassicSolo;
            this.classicModeService.saveRoom(room, socket);
            this.server.to(room.roomId).emit(GameEvents.CreateSoloGame, room.clientGame);
        }
    }

    @SubscribeMessage(GameEvents.CreateOneVsOneGame)
    async createOneVsOneGame(@ConnectedSocket() socket: Socket, @MessageBody('player') playerName: string, @MessageBody('gameId') gameId: string) {
        const room = await this.classicModeService.createRoom(playerName, gameId);
        if (room) {
            room.clientGame.mode = GameModes.ClassicOneVsOne;
            this.classicModeService.saveRoom(room, socket);
            this.classicModeService.checkRoomOneVsOneAvailability(gameId, this.server);
            this.server.to(room.roomId).emit(GameEvents.RoomOneVsOneCreated, room.roomId);
        }
    }

    @SubscribeMessage(GameEvents.RemoveDiff)
    validateCoords(@ConnectedSocket() socket: Socket, @MessageBody() coords: Coordinate) {
        const roomId = Array.from(socket.rooms.values())[1];
        this.classicModeService.verifyCoords(roomId, coords, this.server);
    }

    @SubscribeMessage(GameEvents.CheckStatus)
    checkStatus(@ConnectedSocket() socket: Socket) {
        const roomId = Array.from(socket.rooms.values())[1];
        this.classicModeService.endGame(roomId, this.server);
    }

    @SubscribeMessage(GameEvents.Disconnect)
    deleteCreatedSoloGameRoom(@ConnectedSocket() socket: Socket) {
        const roomId = Array.from(socket.rooms.values())[1];
        this.classicModeService.deleteCreatedSoloGameRoom(roomId);
    }

    @SubscribeMessage(GameEvents.CheckRoomOneVsOneAvailability)
    checkRoomOneVsOneAvailability(@MessageBody() gameId: string) {
        this.classicModeService.checkRoomOneVsOneAvailability(gameId, this.server);
    }

    @SubscribeMessage(GameEvents.UpdateRoomOneVsOneAvailability)
    updateRoomOneVsOneAvailability(@MessageBody() data: { gameId: string; isAvailable: boolean }) {
        this.classicModeService.updateRoomOneVsOneAvailability(data.gameId, data.isAvailable, this.server);
    }

    @SubscribeMessage(GameEvents.DeleteCreatedOneVsOneRoom)
    deleteCreatedOneVsOneRoom(@MessageBody() gameId: string) {
        this.classicModeService.deleteCreatedOneVsOneRoom(gameId, this.server);
    }

    @SubscribeMessage(GameEvents.UpdateWaitingPlayerNameList)
    updateWaitingPlayerNameList(@MessageBody() data: { gameId: string; playerName: string }) {
        this.classicModeService.updateWaitingPlayerNameList(data.gameId, data.playerName, this.server);
    }

    @SubscribeMessage(GameEvents.RefusePlayer)
    refusePlayer(@MessageBody() data: { gameId: string; playerName: string }) {
        this.classicModeService.refusePlayer(data.gameId, data.playerName, this.server);
    }
    @SubscribeMessage(GameEvents.AcceptPlayer)
    acceptPlayer(@ConnectedSocket() socket: Socket, @MessageBody() data: { gameId: string; playerName: string }) {
        this.classicModeService.acceptPlayer(data.gameId, data.playerName, socket);
    }

    @SubscribeMessage(GameEvents.CheckIfPlayerNameIsAvailable)
    checkIfPlayerNameIsAvailable(@MessageBody() data: { gameId: string; playerName: string }) {
        this.classicModeService.checkIfPlayerNameIsAvailable(data.gameId, data.playerName, this.server);
    }

    @SubscribeMessage(GameEvents.CancelJoining)
    cancelJoining(@MessageBody() data: { gameId: string; playerName: string }) {
        this.classicModeService.cancelJoining(data.gameId, data.playerName, this.server);
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
        this.classicModeService.endGame(socket.id, this.server);
    }

    updateTimers() {
        for (const roomId of this.classicModeService['rooms'].keys()) {
            this.classicModeService.updateTimer(roomId, this.server);
        }
    }
}
