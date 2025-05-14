import { NotificationType } from '../schemas/notification.schema';
export declare class CreateNotificationDto {
    readonly recipient: string;
    readonly type: NotificationType;
    readonly title: string;
    readonly message: string;
    readonly reference?: string;
    readonly referenceModel?: 'Job' | 'User' | 'Review';
    readonly metadata?: Record<string, any>;
}
export declare class UpdateNotificationDto {
    readonly read?: boolean;
}
export declare class NotificationResponseDto {
    readonly id: string;
    readonly recipient: string;
    readonly type: NotificationType;
    readonly title: string;
    readonly message: string;
    readonly read: boolean;
    readonly reference?: string;
    readonly referenceModel?: string;
    readonly metadata?: Record<string, any>;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
