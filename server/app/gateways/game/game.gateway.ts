import { ClassicSoloModeService } from '@app/services/classic-solo-mode/classic-solo-mode.service';
import { Coordinate } from '@common/coordinate';
import { GameEvents } from '@common/game-interfaces';
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

    constructor(private readonly logger: Logger, private readonly classicSoloModeService: ClassicSoloModeService) {}

    @SubscribeMessage(GameEvents.CreateSoloGame)
    async createSoloGame(@ConnectedSocket() socket: Socket, @MessageBody('player') playerName: string, @MessageBody('gameId') gameId: string) {
        const room = await this.classicSoloModeService.createSoloRoom(socket, playerName, gameId);
        if (room) {
            this.server.to(room.roomId).emit(GameEvents.CreateSoloGame, room.clientGame);
        }
    }

    @SubscribeMessage(GameEvents.RemoveDiff)
    validateCoords(@ConnectedSocket() socket: Socket, @MessageBody() coords: Coordinate) {
        this.classicSoloModeService.verifyCoords(socket.id, coords, this.server);
    }

    @SubscribeMessage(GameEvents.CheckStatus)
    checkStatus(@MessageBody() socketId: string) {
        this.classicSoloModeService.endGame(socketId, this.server);
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
        this.classicSoloModeService.endGame(socket.id, this.server);
    }

    updateTimers() {
        for (const roomId of this.classicSoloModeService['rooms'].keys()) {
            this.classicSoloModeService.updateTimer(roomId, this.server);
        }
    }
}
