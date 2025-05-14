import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum ReviewStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export enum ReviewType {
    MILESTONE = 'milestone',
    FREELANCER = 'freelancer',
    CLIENT = 'client',
}

@Schema({ timestamps: true })
export class Review extends Document {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Job', required: true })
    job: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    reviewer: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    reviewee: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    milestoneIndex: number;

    @Prop({ required: true })
    rating: number;

    @Prop({ required: true })
    comment: string;

    @Prop({ default: false })
    approved: boolean;

    @Prop({ required: true, enum: ['Job', 'User', 'Milestone'] })
    onModel: string;

    @Prop({ enum: ReviewType, required: true })
    type: ReviewType;

    @Prop({ enum: ReviewStatus, default: ReviewStatus.PENDING })
    status: ReviewStatus;

    @Prop({ required: true })
    content: string;

    @Prop({ min: 1, max: 5, default: null })
    rating: number;

    @Prop({ default: 0 })
    rewardAmount: number;

    @Prop({ default: false })
    rewardPaid: boolean;

    @Prop({ required: false })
    transactionHash: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review); 