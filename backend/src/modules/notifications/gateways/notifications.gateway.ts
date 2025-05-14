import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../auth/dto/auth.dto';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('NotificationsGateway');
    private connectedClients: Map<string, Socket> = new Map();

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

            if (!token) {
                this.logger.warn('Client tried to connect without a token');
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify<JwtPayload>(token, {
                secret: this.configService.get<string>('JWT_SECRET'),
            });

            if (!payload || !payload.userId) {
                this.logger.warn('Invalid token provided');
                client.disconnect();
                return;
            }

            this.logger.log(`Client connected: ${payload.userId}`);
            this.connectedClients.set(payload.userId, client);

            // Join user-specific room
            client.join(`user_${payload.userId}`);

            // Join role-specific room
            if (payload.role) {
                client.join(`role_${payload.role}`);
            }
        } catch (e) {
            this.logger.error(`Error during socket connection: ${e.message}`);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        // Find and remove the disconnected client
        for (const [userId, socket] of this.connectedClients.entries()) {
            if (socket.id === client.id) {
                this.logger.log(`Client disconnected: ${userId}`);
                this.connectedClients.delete(userId);
                break;
            }
        }
    }

    @SubscribeMessage('subscribe')
    handleSubscribe(client: Socket, payload: { rooms: string[] }) {
        if (payload.rooms && Array.isArray(payload.rooms)) {
            payload.rooms.forEach(room => {
                client.join(room);
                this.logger.log(`Client ${client.id} joined room: ${room}`);
            });
        }
        return { success: true };
    }

    @SubscribeMessage('unsubscribe')
    handleUnsubscribe(client: Socket, payload: { rooms: string[] }) {
        if (payload.rooms && Array.isArray(payload.rooms)) {
            payload.rooms.forEach(room => {
                client.leave(room);
                this.logger.log(`Client ${client.id} left room: ${room}`);
            });
        }
        return { success: true };
    }

    /**
     * Send notification to a specific user
     */
    sendToUser(userId: string, event: string, data: any) {
        this.server.to(`user_${userId}`).emit(event, data);
    }

    /**
     * Send notification to all users with a specific role
     */
    sendToRole(role: string, event: string, data: any) {
        this.server.to(`role_${role}`).emit(event, data);
    }

    /**
     * Send notification to a specific room
     */
    sendToRoom(room: string, event: string, data: any) {
        this.server.to(room).emit(event, data);
    }

    /**
     * Send notification to all connected clients
     */
    sendToAll(event: string, data: any) {
        this.server.emit(event, data);
    }
} 