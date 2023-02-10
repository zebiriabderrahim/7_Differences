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
import { DELAY_BEFORE_EMITTING_TIME, PRIVATE_ROOM_ID } from './game.gateway.constants';

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

    private readonly room = PRIVATE_ROOM_ID;

    constructor(private readonly logger: Logger, private readonly classicSoloModeService: ClassicSoloModeService) {}

    @SubscribeMessage(GameEvents.CreateSoloGame)
    createSoloGame(@ConnectedSocket() socket: Socket, @MessageBody('playerName') playerName: string, @MessageBody('gameId') gameId: number) {
        try {
            const room = this.classicSoloModeService.createSoloRoom(socket, playerName, gameId);
            if (room) {
                this.server.to(room.roomId).emit(GameEvents.CreateSoloGame, room.clientGame);
            }
        } catch (error) {
            this.server.to(socket.id).emit(GameEvents.CreateSoloGame, 'Erreur lors de la création de la partie');
        }
    }

    @SubscribeMessage(GameEvents.RemoveDiff)
    validateCoords(@ConnectedSocket() socket: Socket, @MessageBody() coords: Coordinate) {
        try {
            this.classicSoloModeService.verifyCoords(socket.id, coords, this.server);
        } catch (error) {
            this.server.to(socket.id).emit(GameEvents.RemoveDiff, 'Erreur lors de la validation des coordonnées');
        }
    }

    @SubscribeMessage(GameEvents.Penalty)
    applyPenalty(@ConnectedSocket() socket: Socket) {
        try {
            this.classicSoloModeService.addPenalty(socket.id);
        } catch (error) {
            this.server.to(socket.id).emit(GameEvents.Penalty, "Erreur lors de l'application de la pénalité");
        }
    }

    @SubscribeMessage(GameEvents.CheckStatus)
    roomMessage(socket: Socket, message: string) {
        // Seulement un membre de la salle peut envoyer un message aux autres
        if (socket.rooms.has(this.room)) {
            this.server.to(this.room).emit(GameEvents.CheckStatus, `${socket.id} : ${message}`);
        }
    }

    @SubscribeMessage(GameEvents.TimerStarted)
    updateTimers() {
        // for (const room of this.classicSoloModeService['rooms']) {
        //     this.classicSoloModeService.updateTimer(room['roomId']);
        // }
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
}
