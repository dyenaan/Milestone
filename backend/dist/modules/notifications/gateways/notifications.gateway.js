"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
let NotificationsGateway = class NotificationsGateway {
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = new common_1.Logger('NotificationsGateway');
        this.connectedClients = new Map();
    }
    async handleConnection(client) {
        var _a;
        try {
            const token = client.handshake.auth.token || ((_a = client.handshake.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]);
            if (!token) {
                this.logger.warn('Client tried to connect without a token');
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get('JWT_SECRET'),
            });
            if (!payload || !payload.userId) {
                this.logger.warn('Invalid token provided');
                client.disconnect();
                return;
            }
            this.logger.log(`Client connected: ${payload.userId}`);
            this.connectedClients.set(payload.userId, client);
            client.join(`user_${payload.userId}`);
            if (payload.role) {
                client.join(`role_${payload.role}`);
            }
        }
        catch (e) {
            this.logger.error(`Error during socket connection: ${e.message}`);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        for (const [userId, socket] of this.connectedClients.entries()) {
            if (socket.id === client.id) {
                this.logger.log(`Client disconnected: ${userId}`);
                this.connectedClients.delete(userId);
                break;
            }
        }
    }
    handleSubscribe(client, payload) {
        if (payload.rooms && Array.isArray(payload.rooms)) {
            payload.rooms.forEach(room => {
                client.join(room);
                this.logger.log(`Client ${client.id} joined room: ${room}`);
            });
        }
        return { success: true };
    }
    handleUnsubscribe(client, payload) {
        if (payload.rooms && Array.isArray(payload.rooms)) {
            payload.rooms.forEach(room => {
                client.leave(room);
                this.logger.log(`Client ${client.id} left room: ${room}`);
            });
        }
        return { success: true };
    }
    sendToUser(userId, event, data) {
        this.server.to(`user_${userId}`).emit(event, data);
    }
    sendToRole(role, event, data) {
        this.server.to(`role_${role}`).emit(event, data);
    }
    sendToRoom(room, event, data) {
        this.server.to(room).emit(event, data);
    }
    sendToAll(event, data) {
        this.server.emit(event, data);
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], NotificationsGateway.prototype, "handleSubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unsubscribe'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], NotificationsGateway.prototype, "handleUnsubscribe", null);
NotificationsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], NotificationsGateway);
exports.NotificationsGateway = NotificationsGateway;
//# sourceMappingURL=notifications.gateway.js.map