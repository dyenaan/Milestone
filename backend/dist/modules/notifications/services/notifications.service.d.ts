import { Model } from 'mongoose';
import { Notification, NotificationType } from '../schemas/notification.schema';
import { CreateNotificationDto } from '../dto/notification.dto';
import { NotificationsGateway } from '../gateways/notifications.gateway';
export declare class NotificationsService {
    private notificationModel;
    private notificationsGateway;
    private readonly logger;
    constructor(notificationModel: Model<Notification>, notificationsGateway: NotificationsGateway);
    create(createNotificationDto: CreateNotificationDto): Promise<Notification>;
    findAllForUser(userId: string): Promise<Notification[]>;
    findUnreadForUser(userId: string): Promise<Notification[]>;
    markAsRead(notificationId: string): Promise<Notification>;
    markAllAsRead(userId: string): Promise<void>;
    delete(notificationId: string): Promise<void>;
    createJobNotification(userId: string, type: NotificationType, jobId: string, jobTitle: string): Promise<Notification>;
    createMilestoneNotification(userId: string, type: NotificationType, jobId: string, jobTitle: string, milestoneIndex: number, milestoneTitle: string): Promise<Notification>;
    createReviewerNotification(userId: string, type: NotificationType, amount?: number, transactionHash?: string): Promise<Notification>;
}
