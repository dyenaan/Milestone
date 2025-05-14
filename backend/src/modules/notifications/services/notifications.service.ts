import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationType } from '../schemas/notification.schema';
import { CreateNotificationDto } from '../dto/notification.dto';
import { NotificationsGateway } from '../gateways/notifications.gateway';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        @InjectModel(Notification.name) private notificationModel: Model<Notification>,
        private notificationsGateway: NotificationsGateway,
    ) { }

    /**
     * Create a new notification and send it via WebSocket
     */
    async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
        this.logger.log(`Creating notification for recipient: ${createNotificationDto.recipient}`);

        const notification = new this.notificationModel(createNotificationDto);
        const savedNotification = await notification.save();

        // Send notification via WebSocket
        this.notificationsGateway.sendToUser(
            createNotificationDto.recipient,
            'notification',
            savedNotification,
        );

        return savedNotification;
    }

    /**
     * Find all notifications for a user
     */
    async findAllForUser(userId: string): Promise<Notification[]> {
        return this.notificationModel.find({ recipient: userId }).sort({ createdAt: -1 }).exec();
    }

    /**
     * Find unread notifications for a user
     */
    async findUnreadForUser(userId: string): Promise<Notification[]> {
        return this.notificationModel.find({ recipient: userId, read: false }).sort({ createdAt: -1 }).exec();
    }

    /**
     * Mark a notification as read
     */
    async markAsRead(notificationId: string): Promise<Notification> {
        return this.notificationModel.findByIdAndUpdate(
            notificationId,
            { read: true },
            { new: true },
        ).exec();
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string): Promise<void> {
        await this.notificationModel.updateMany(
            { recipient: userId, read: false },
            { read: true },
        ).exec();
    }

    /**
     * Delete a notification
     */
    async delete(notificationId: string): Promise<void> {
        await this.notificationModel.findByIdAndDelete(notificationId).exec();
    }

    /**
     * Create a job-related notification
     */
    async createJobNotification(
        userId: string,
        type: NotificationType,
        jobId: string,
        jobTitle: string,
    ): Promise<Notification> {
        let title = '';
        let message = '';

        switch (type) {
            case NotificationType.NEW_JOB:
                title = 'New Job Posted';
                message = `A new job "${jobTitle}" has been posted`;
                break;
            case NotificationType.JOB_ACCEPTED:
                title = 'Job Accepted';
                message = `Your job "${jobTitle}" has been accepted`;
                break;
            default:
                title = 'Job Update';
                message = `Your job "${jobTitle}" has been updated`;
        }

        return this.create({
            recipient: userId,
            type,
            title,
            message,
            reference: jobId,
            referenceModel: 'Job',
            metadata: { jobId },
        });
    }

    /**
     * Create a milestone-related notification
     */
    async createMilestoneNotification(
        userId: string,
        type: NotificationType,
        jobId: string,
        jobTitle: string,
        milestoneIndex: number,
        milestoneTitle: string,
    ): Promise<Notification> {
        let title = '';
        let message = '';

        switch (type) {
            case NotificationType.MILESTONE_SUBMITTED:
                title = 'Milestone Submitted';
                message = `A milestone "${milestoneTitle}" has been submitted for job "${jobTitle}"`;
                break;
            case NotificationType.MILESTONE_REVIEW_REQUESTED:
                title = 'Review Requested';
                message = `Your review is requested for milestone "${milestoneTitle}" in job "${jobTitle}"`;
                break;
            case NotificationType.MILESTONE_APPROVED:
                title = 'Milestone Approved';
                message = `The milestone "${milestoneTitle}" in job "${jobTitle}" has been approved`;
                break;
            case NotificationType.MILESTONE_REJECTED:
                title = 'Milestone Rejected';
                message = `The milestone "${milestoneTitle}" in job "${jobTitle}" has been rejected`;
                break;
            case NotificationType.PAYMENT_RELEASED:
                title = 'Payment Released';
                message = `Payment for milestone "${milestoneTitle}" in job "${jobTitle}" has been released`;
                break;
            default:
                title = 'Milestone Update';
                message = `Milestone "${milestoneTitle}" in job "${jobTitle}" has been updated`;
        }

        return this.create({
            recipient: userId,
            type,
            title,
            message,
            reference: jobId,
            referenceModel: 'Job',
            metadata: { jobId, milestoneIndex, milestoneTitle },
        });
    }

    /**
     * Create a reviewer-related notification
     */
    async createReviewerNotification(
        userId: string,
        type: NotificationType,
        amount?: number,
        transactionHash?: string,
    ): Promise<Notification> {
        let title = '';
        let message = '';

        switch (type) {
            case NotificationType.REVIEWER_ASSIGNED:
                title = 'Assigned as Reviewer';
                message = 'You have been assigned as a reviewer for a milestone';
                break;
            case NotificationType.REVIEWER_REWARDED:
                title = 'Reviewer Reward';
                message = `You have received a reward of ${amount} tokens for your review`;
                break;
            default:
                title = 'Reviewer Update';
                message = 'There is an update to your reviewer status';
        }

        return this.create({
            recipient: userId,
            type,
            title,
            message,
            metadata: { amount, transactionHash },
        });
    }
} 