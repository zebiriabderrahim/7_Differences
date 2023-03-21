import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { Coordinate } from '@common/coordinate';
import { AcceptedPlayer, ChatMessage, GameEvents, GameModes, MessageEvents, WaitingPlayerNameList } from '@common/game-interfaces';
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
    async createSoloGame(@ConnectedSocket() socket: Socket, @MessageBody('playerName') playerName: string, @MessageBody('gameId') gameId: string) {
        const room = await this.classicModeService.createRoom(playerName, gameId);
        if (room) {
            room.clientGame.mode = GameModes.ClassicSolo;
            room.player1.playerId = socket.id;
            this.classicModeService.saveRoom(room);
            this.server.to(socket.id).emit(GameEvents.RoomSoloCreated, room.roomId);
        }
    }

    @SubscribeMessage(GameEvents.StartGameByRoomId)
    startGame(@ConnectedSocket() socket: Socket, @MessageBody('roomId') roomId: string, @MessageBody('playerName') playerName: string) {
        const room = this.classicModeService.getRoomByRoomId(roomId);
        if (!room) return;
        socket.join(roomId);
        if (room.player1.name === playerName) {
            room.player1.playerId = socket.id;
        } else if (room.clientGame.mode === GameModes.ClassicOneVsOne) {
            room.player2.playerId = socket.id;
        }
        this.classicModeService.saveRoom(room);
        this.server.to(roomId).emit(GameEvents.GameStarted, {
            clientGame: room.clientGame,
            players: { player1: room.player1, player2: room.player2 },
            cheatDifferences: room.originalDifferences.flat(),
        });
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
        this.classicModeService.verifyCoords(socket, coords, this.server);
    }

    @SubscribeMessage(GameEvents.CheckStatus)
    checkStatus(@ConnectedSocket() socket: Socket) {
        this.classicModeService.endGame(socket, this.server);
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
        this.classicModeService.cancelAllJoining(gameId, this.server);
        this.server.emit(GameEvents.UndoCreation, gameId);
    }

    @SubscribeMessage(GameEvents.UpdateWaitingPlayerNameList)
    updateWaitingPlayerNameList(@ConnectedSocket() socket: Socket, @MessageBody() data: { gameId: string; playerName: string }) {
        this.classicModeService.updateWaitingPlayerNameList(data.gameId, data.playerName, socket);
        const playerNamesList = this.classicModeService.getWaitingPlayerNameList(data.gameId);
        const waitingPlayerNameList: WaitingPlayerNameList = {
            gameId: data.gameId,
            playerNamesList,
        };
        this.server.emit(GameEvents.UpdateWaitingPlayerNameList, waitingPlayerNameList);
    }

    @SubscribeMessage(GameEvents.RefusePlayer)
    refusePlayer(@MessageBody() data: { gameId: string; playerName: string }) {
        this.classicModeService.refusePlayer(data.gameId, data.playerName, this.server);
    }

    @SubscribeMessage(GameEvents.AcceptPlayer)
    acceptPlayer(@MessageBody() data: { gameId: string; roomId: string; playerNameCreator: string }) {
        const acceptedPlayerName = this.classicModeService.acceptPlayer(data.gameId, data.roomId, data.playerNameCreator);
        this.classicModeService.updateRoomOneVsOneAvailability(data.gameId, this.server);
        const acceptedPlayerInRoom: AcceptedPlayer = {
            gameId: data.gameId,
            roomId: data.roomId,
            playerName: acceptedPlayerName,
        };
        this.server.emit(GameEvents.PlayerAccepted, acceptedPlayerInRoom);
        this.gameCardDeleted(data.gameId);
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
    abandonGame(@ConnectedSocket() socket) {
        this.classicModeService.abandonGame(socket, this.server);
    }

    @SubscribeMessage(MessageEvents.LocalMessage)
    sendMessage(@ConnectedSocket() socket: Socket, @MessageBody() data: ChatMessage) {
        const roomId = this.classicModeService.getRoomIdFromSocket(socket);
        socket.broadcast.to(roomId).emit(MessageEvents.LocalMessage, data);
    }
    @SubscribeMessage(GameEvents.DeleteGameCard)
    gameCardDeleted(@MessageBody() gameId: string) {
        this.server.emit(GameEvents.GameCardDeleted, gameId);
        this.server.emit(GameEvents.UndoCreation, gameId);
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
            const room = this.classicModeService.getRoomByRoomId(roomId);
            if ((room.player2 && room.clientGame.mode === GameModes.ClassicOneVsOne) || room.clientGame.mode === GameModes.ClassicSolo)
                this.classicModeService.updateTimer(roomId, this.server);
        }
    }
}
