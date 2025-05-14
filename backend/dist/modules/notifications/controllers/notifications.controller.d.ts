import { NotificationsService } from '../services/notifications.service';
import { CreateNotificationDto, NotificationResponseDto } from '../dto/notification.dto';
import { Request } from 'express';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(req: Request): Promise<NotificationResponseDto[]>;
    findUnread(req: Request): Promise<NotificationResponseDto[]>;
    markAsRead(id: string): Promise<NotificationResponseDto>;
    markAllAsRead(req: Request): Promise<void>;
    remove(id: string): Promise<void>;
    create(createNotificationDto: CreateNotificationDto): Promise<NotificationResponseDto>;
}
