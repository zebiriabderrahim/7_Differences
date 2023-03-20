import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
// This code belongs to Nikolay Radoev
// https://gitlab.com/nikolayradoev/socket-io-exemple/-/tree/master

@Injectable({
    providedIn: 'root',
})
export class ClientSocketService {
    socket: Socket;
    private readonly baseUrl: string;
    constructor() {
        this.baseUrl = environment.serverUrl.replace('/api', '');
    }
    isSocketAlive() {
        return this.socket && this.socket.connected;
    }

    connect() {
        this.socket = io(this.baseUrl, { transports: ['websocket'], upgrade: false });
    }

    disconnect() {
        this.socket.disconnect();
    }

    on<T>(event: string, action: (data: T) => void): void {
        this.socket.on(event, action);
    }

    send<T>(event: string, data?: T): void {
        if (data) {
            this.socket.emit(event, data);
        } else {
            this.socket.emit(event);
        }
    }
}
