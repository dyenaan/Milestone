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
exports.NotificationSchema = exports.Notification = exports.NotificationType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var NotificationType;
(function (NotificationType) {
    NotificationType["NEW_JOB"] = "new_job";
    NotificationType["JOB_ACCEPTED"] = "job_accepted";
    NotificationType["MILESTONE_SUBMITTED"] = "milestone_submitted";
    NotificationType["MILESTONE_REVIEW_REQUESTED"] = "milestone_review_requested";
    NotificationType["MILESTONE_APPROVED"] = "milestone_approved";
    NotificationType["MILESTONE_REJECTED"] = "milestone_rejected";
    NotificationType["PAYMENT_RELEASED"] = "payment_released";
    NotificationType["REVIEWER_ASSIGNED"] = "reviewer_assigned";
    NotificationType["REVIEWER_REWARDED"] = "reviewer_rewarded";
})(NotificationType = exports.NotificationType || (exports.NotificationType = {}));
let Notification = class Notification extends mongoose_2.Document {
};
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], Notification.prototype, "recipient", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: NotificationType, required: true }),
    __metadata("design:type", String)
], Notification.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Notification.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Notification.prototype, "message", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Notification.prototype, "read", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        refPath: 'referenceModel',
        required: false
    }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], Notification.prototype, "reference", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, enum: ['Job', 'User', 'Review'] }),
    __metadata("design:type", String)
], Notification.prototype, "referenceModel", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            jobId: mongoose_2.Schema.Types.ObjectId,
            milestoneIndex: Number,
            amount: Number,
            transactionHash: String,
        },
        required: false,
    }),
    __metadata("design:type", Object)
], Notification.prototype, "metadata", void 0);
Notification = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Notification);
exports.Notification = Notification;
exports.NotificationSchema = mongoose_1.SchemaFactory.createForClass(Notification);
//# sourceMappingURL=notification.schema.js.map