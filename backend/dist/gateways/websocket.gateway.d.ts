import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class WebSocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private logger;
    private users;
    server: Server;
    afterInit(server: Server): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleIdentity(client: Socket, payload: {
        userId: string;
    }): void;
    sendToUser(userId: string, event: string, data: any): void;
    broadcastEvent(event: string, data: any): void;
}
