import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum NotificationType {
    NEW_JOB = 'new_job',
    JOB_ACCEPTED = 'job_accepted',
    MILESTONE_SUBMITTED = 'milestone_submitted',
    MILESTONE_REVIEW_REQUESTED = 'milestone_review_requested',
    MILESTONE_APPROVED = 'milestone_approved',
    MILESTONE_REJECTED = 'milestone_rejected',
    PAYMENT_RELEASED = 'payment_released',
    REVIEWER_ASSIGNED = 'reviewer_assigned',
    REVIEWER_REWARDED = 'reviewer_rewarded',
}

@Schema({ timestamps: true })
export class Notification extends Document {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    recipient: MongooseSchema.Types.ObjectId;

    @Prop({ enum: NotificationType, required: true })
    type: NotificationType;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    message: string;

    @Prop({ default: false })
    read: boolean;

    @Prop({
        type: MongooseSchema.Types.ObjectId,
        refPath: 'referenceModel',
        required: false
    })
    reference: MongooseSchema.Types.ObjectId;

    @Prop({ required: false, enum: ['Job', 'User', 'Review'] })
    referenceModel: string;

    @Prop({
        type: {
            jobId: MongooseSchema.Types.ObjectId,
            milestoneIndex: Number,
            amount: Number,
            transactionHash: String,
        },
        required: false,
    })
    metadata: Record<string, any>;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification); 