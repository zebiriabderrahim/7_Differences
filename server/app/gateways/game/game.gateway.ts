import { Injectable, Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DELAY_BEFORE_EMITTING_TIME, PRIVATE_ROOM_ID, WORD_MIN_LENGTH } from './game.gateway.constants';
import { GameEvents } from './game.gateway.events';

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

    constructor(private readonly logger: Logger) {}

    @SubscribeMessage(GameEvents.CreateSoloGame)
    createSoloGame(socket: Socket, word: string) {
        socket.emit(GameEvents.CreateSoloGame, word.length > WORD_MIN_LENGTH);
    }

    @SubscribeMessage(GameEvents.ValidateCoords)
    validateCoords(socket: Socket, message: string) {
        this.server.emit(GameEvents.ValidateCoords, `${socket.id} : ${message}`);
    }

    @SubscribeMessage(GameEvents.CheckStatus)
    roomMessage(socket: Socket, message: string) {
        // Seulement un membre de la salle peut envoyer un message aux autres
        if (socket.rooms.has(this.room)) {
            this.server.to(this.room).emit(GameEvents.CheckStatus, `${socket.id} : ${message}`);
        }
    }

    afterInit() {
        setInterval(() => {
            this.emitTime();
        }, DELAY_BEFORE_EMITTING_TIME);
    }

    handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
        // message initial
        socket.emit(GameEvents.Connection, 'Hello World!');
    }

    handleDisconnect(socket: Socket) {
        this.logger.log(`Déconnexion par l'utilisateur avec id : ${socket.id}`);
    }

    private emitTime() {
        this.server.emit(GameEvents.CheckStatus, new Date().toLocaleTimeString());
    }
}
