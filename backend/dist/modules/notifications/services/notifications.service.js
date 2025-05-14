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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_schema_1 = require("../schemas/notification.schema");
const notifications_gateway_1 = require("../gateways/notifications.gateway");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(notificationModel, notificationsGateway) {
        this.notificationModel = notificationModel;
        this.notificationsGateway = notificationsGateway;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    async create(createNotificationDto) {
        this.logger.log(`Creating notification for recipient: ${createNotificationDto.recipient}`);
        const notification = new this.notificationModel(createNotificationDto);
        const savedNotification = await notification.save();
        this.notificationsGateway.sendToUser(createNotificationDto.recipient, 'notification', savedNotification);
        return savedNotification;
    }
    async findAllForUser(userId) {
        return this.notificationModel.find({ recipient: userId }).sort({ createdAt: -1 }).exec();
    }
    async findUnreadForUser(userId) {
        return this.notificationModel.find({ recipient: userId, read: false }).sort({ createdAt: -1 }).exec();
    }
    async markAsRead(notificationId) {
        return this.notificationModel.findByIdAndUpdate(notificationId, { read: true }, { new: true }).exec();
    }
    async markAllAsRead(userId) {
        await this.notificationModel.updateMany({ recipient: userId, read: false }, { read: true }).exec();
    }
    async delete(notificationId) {
        await this.notificationModel.findByIdAndDelete(notificationId).exec();
    }
    async createJobNotification(userId, type, jobId, jobTitle) {
        let title = '';
        let message = '';
        switch (type) {
            case notification_schema_1.NotificationType.NEW_JOB:
                title = 'New Job Posted';
                message = `A new job "${jobTitle}" has been posted`;
                break;
            case notification_schema_1.NotificationType.JOB_ACCEPTED:
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
    async createMilestoneNotification(userId, type, jobId, jobTitle, milestoneIndex, milestoneTitle) {
        let title = '';
        let message = '';
        switch (type) {
            case notification_schema_1.NotificationType.MILESTONE_SUBMITTED:
                title = 'Milestone Submitted';
                message = `A milestone "${milestoneTitle}" has been submitted for job "${jobTitle}"`;
                break;
            case notification_schema_1.NotificationType.MILESTONE_REVIEW_REQUESTED:
                title = 'Review Requested';
                message = `Your review is requested for milestone "${milestoneTitle}" in job "${jobTitle}"`;
                break;
            case notification_schema_1.NotificationType.MILESTONE_APPROVED:
                title = 'Milestone Approved';
                message = `The milestone "${milestoneTitle}" in job "${jobTitle}" has been approved`;
                break;
            case notification_schema_1.NotificationType.MILESTONE_REJECTED:
                title = 'Milestone Rejected';
                message = `The milestone "${milestoneTitle}" in job "${jobTitle}" has been rejected`;
                break;
            case notification_schema_1.NotificationType.PAYMENT_RELEASED:
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
    async createReviewerNotification(userId, type, amount, transactionHash) {
        let title = '';
        let message = '';
        switch (type) {
            case notification_schema_1.NotificationType.REVIEWER_ASSIGNED:
                title = 'Assigned as Reviewer';
                message = 'You have been assigned as a reviewer for a milestone';
                break;
            case notification_schema_1.NotificationType.REVIEWER_REWARDED:
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
};
NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        notifications_gateway_1.NotificationsGateway])
], NotificationsService);
exports.NotificationsService = NotificationsService;
//# sourceMappingURL=notifications.service.js.map