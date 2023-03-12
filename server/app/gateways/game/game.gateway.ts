import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { Coordinate } from '@common/coordinate';
import { ChatMessage, GameEvents, GameModes, MessageEvents } from '@common/game-interfaces';
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
        const room = await this.classicModeService.createRoom(socket, playerName, gameId);
        if (room) {
            room.clientGame.mode = GameModes.ClassicSolo;
            this.classicModeService.saveRoom(room, socket);
            this.server.to(room.roomId).emit(GameEvents.CreateSoloGame, room.clientGame);
        }
    }

    @SubscribeMessage(GameEvents.CreateOneVsOneGame)
    async createOneVsOneGame(@ConnectedSocket() socket: Socket, @MessageBody('player') playerName: string, @MessageBody('gameId') gameId: string) {
        const room = await this.classicModeService.createRoom(socket, playerName, gameId);
        if (room) {
            room.clientGame.mode = GameModes.ClassicOneVsOne;
            this.classicModeService.saveRoom(room, socket);
            this.classicModeService.checkRoomOneVsOneAvailability(gameId, this.server);
            this.server.to(room.roomId).emit(GameEvents.CreateSoloGame, room.clientGame);
        }
    }

    @SubscribeMessage(GameEvents.JoinOneVsOneGame)
    joinOneVsOneGame(@ConnectedSocket() socket: Socket, @MessageBody('player') playerName: string, @MessageBody('gameId') gameId: string) {
        const room = this.classicModeService.getOneVsOneRoomByGameId(gameId);
        if (room) {
            this.classicModeService.joinRoom(room.roomId, playerName, socket);
            this.classicModeService.checkRoomOneVsOneAvailability(gameId, this.server);
            this.server.to(room.roomId).emit(GameEvents.JoinOneVsOneGame, room.clientGame);
        }
    }

    @SubscribeMessage(GameEvents.RemoveDiff)
    validateCoords(@ConnectedSocket() socket: Socket, @MessageBody('coords') coords: Coordinate, @MessageBody('playerName') playerName: string) {
        const roomId = Array.from(socket.rooms.values())[1];
        this.classicModeService.verifyCoords(roomId, coords, playerName, this.server);
    }

    @SubscribeMessage(GameEvents.CheckStatus)
    checkStatus(@ConnectedSocket() socket: Socket, @MessageBody() playerName: string) {
        const roomId = Array.from(socket.rooms.values())[1];
        this.classicModeService.endGame(roomId, playerName, this.server);
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

    @SubscribeMessage(GameEvents.WaitingPlayerNameListByGameId)
    waitingPlayerNameListByGameId(@MessageBody() gameId: string) {
        const player2NamesList = this.classicModeService.getWaitingPlayerNameList(gameId);
        if (player2NamesList) {
            this.server.emit(GameEvents.UpdateWaitingPlayerNameList, { gameId, player2NamesList });
        }
    }

    @SubscribeMessage(GameEvents.RefusePlayer)
    refusePlayer(@MessageBody() data: { gameId: string; playerNames: string[] }) {
        this.classicModeService.refusePlayer(data.gameId, data.playerNames, this.server);
    }

    @SubscribeMessage(MessageEvents.LocalMessage)
    sendMessage(@ConnectedSocket() socket: Socket, @MessageBody() data: ChatMessage) {
        const roomId = Array.from(socket.rooms.values())[1];
        socket.broadcast.to(roomId).emit(MessageEvents.LocalMessage, data);
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
        // this.classicModeService.endGame(socket.id, this.server);
    }

    updateTimers() {
        for (const roomId of this.classicModeService['rooms'].keys()) {
            this.classicModeService.updateTimer(roomId, this.server);
        }
    }
}
