import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
export declare class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private configService;
    server: Server;
    private logger;
    private connectedClients;
    constructor(jwtService: JwtService, configService: ConfigService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleSubscribe(client: Socket, payload: {
        rooms: string[];
    }): {
        success: boolean;
    };
    handleUnsubscribe(client: Socket, payload: {
        rooms: string[];
    }): {
        success: boolean;
    };
    sendToUser(userId: string, event: string, data: any): void;
    sendToRole(role: string, event: string, data: any): void;
    sendToRoom(room: string, event: string, data: any): void;
    sendToAll(event: string, data: any): void;
}
