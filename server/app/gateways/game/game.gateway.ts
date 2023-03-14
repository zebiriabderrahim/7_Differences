import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { Coordinate } from '@common/coordinate';
import { AcceptedPlayer, GameEvents, GameModes } from '@common/game-interfaces';
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
            this.classicModeService.saveRoom(room);
            this.server.to(socket.id).emit(GameEvents.RoomSoloCreated, room.roomId);
        }
    }

    @SubscribeMessage(GameEvents.StartGameByRoomId)
    startOneVsOneGame(@ConnectedSocket() socket: Socket, @MessageBody() roomId: string) {
        const room = this.classicModeService.getRoomByRoomId(roomId);
        if (room) {
            socket.join(roomId);
            if (room.player1.playerId && !room.player2.playerId) {
                room.player1.playerId = socket.id;
                room.player2.playerId = 'not defined yet';
            } else if (room.player2.playerId) {
                room.player2.playerId = socket.id;
            }
            this.classicModeService.saveRoom(room);
            const payload = room.clientGame.mode === GameModes.ClassicOneVsOne ? { player1: room.player1, player2: room.player2 } : undefined;
            this.server.to(roomId)?.emit(GameEvents.GameStarted, { clientGame: room.clientGame, players: payload });
        }
    }

    @SubscribeMessage(GameEvents.CreateOneVsOneRoom)
    async createOneVsOneRoom(@ConnectedSocket() socket: Socket, @MessageBody('gameId') gameId: string) {
        const oneVsOneRoom = await this.classicModeService.createOneVsOneRoom(gameId);
        if (oneVsOneRoom) {
            oneVsOneRoom.player1.playerId = socket.id;
            this.classicModeService.saveRoom(oneVsOneRoom);
            this.server.to(socket.id).emit(GameEvents.RoomOneVsOneCreated, oneVsOneRoom.roomId);
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

    @SubscribeMessage(GameEvents.UpdateRoomOneVsOneAvailability)
    updateRoomOneVsOneAvailability(@MessageBody() gameId: string) {
        this.classicModeService.updateRoomOneVsOneAvailability(gameId, this.server);
    }

    @SubscribeMessage(GameEvents.CheckRoomOneVsOneAvailability)
    checkRoomOneVsOneAvailability(@MessageBody() gameId: string) {
        this.classicModeService.checkRoomOneVsOneAvailability(gameId, this.server);
    }

    @SubscribeMessage(GameEvents.DeleteCreatedOneVsOneRoom)
    deleteCreatedOneVsOneRoom(@MessageBody() gameId: string) {
        this.classicModeService.deleteOneVsOneRoomAvailability(gameId, this.server);
    }

    @SubscribeMessage(GameEvents.UpdateWaitingPlayerNameList)
    updateWaitingPlayerNameList(@MessageBody() data: { gameId: string; playerName: string }) {
        this.classicModeService.updateWaitingPlayerNameList(data.gameId, data.playerName, this.server);
        this.classicModeService.checkRoomOneVsOneAvailability(data.gameId, this.server);
    }

    @SubscribeMessage(GameEvents.RefusePlayer)
    refusePlayer(@MessageBody() data: { gameId: string; playerName: string }) {
        this.classicModeService.refusePlayer(data.gameId, data.playerName, this.server);
    }

    @SubscribeMessage(GameEvents.AcceptPlayer)
    acceptPlayer(@MessageBody() data: { gameId: string; roomId: string; playerNameCreator: string }) {
        const acceptedPlayerName = this.classicModeService.acceptPlayer(data.gameId, data.roomId, data.playerNameCreator);
        const acceptedPlayerInRoom: AcceptedPlayer = {
            gameId: data.gameId,
            roomId: data.roomId,
            playerName: acceptedPlayerName,
        };
        this.server.emit(GameEvents.PlayerAccepted, acceptedPlayerInRoom);
    }

    @SubscribeMessage(GameEvents.CheckIfPlayerNameIsAvailable)
    checkIfPlayerNameIsAvailable(@MessageBody() data: { gameId: string; playerName: string }) {
        this.classicModeService.checkIfPlayerNameIsAvailable(data.gameId, data.playerName, this.server);
    }

    @SubscribeMessage(GameEvents.CancelJoining)
    cancelJoining(@MessageBody() data: { roomId: string; playerName: string }) {
        this.classicModeService.cancelJoining(data.roomId, data.playerName, this.server);
    }

    @SubscribeMessage(GameEvents.AbandonGame)
    abandonGame(@MessageBody() roomId: string) {
        this.classicModeService.abandonGame(roomId, this.server);
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
    }

    updateTimers() {
        for (const roomId of this.classicModeService['rooms'].keys()) {
            const room = this.classicModeService.getRoomByRoomId(roomId);
            if ((room.player2 && room.clientGame.mode === GameModes.ClassicOneVsOne) || room.clientGame.mode === GameModes.ClassicSolo)
                this.classicModeService.updateTimer(roomId, this.server);
        }
    }
}
