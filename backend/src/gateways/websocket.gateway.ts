import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway as NestWebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@NestWebSocketGateway({ cors: true })
export class WebSocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private logger: Logger = new Logger('WebSocketGateway');
    private users: Map<string, string> = new Map();

    @WebSocketServer() server: Server;

    afterInit(server: Server) {
        this.logger.log('WebSocket Gateway initialized');
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
        // Remove user mapping when they disconnect
        for (const [userId, socketId] of this.users.entries()) {
            if (socketId === client.id) {
                this.users.delete(userId);
                break;
            }
        }
    }

    @SubscribeMessage('identity')
    handleIdentity(client: Socket, payload: { userId: string }) {
        this.logger.log(`Identity received: ${payload.userId} for socket: ${client.id}`);
        this.users.set(payload.userId, client.id);
    }

    sendToUser(userId: string, event: string, data: any) {
        const socketId = this.users.get(userId);
        if (socketId) {
            this.server.to(socketId).emit(event, data);
        }
    }

    broadcastEvent(event: string, data: any) {
        this.server.emit(event, data);
    }
} 