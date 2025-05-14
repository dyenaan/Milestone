import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum JobStatus {
    DRAFT = 'draft',
    OPEN = 'open',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Milestone {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    amount: number;

    @Prop({ required: false })
    dueDate: Date;

    @Prop({ default: false })
    isCompleted: boolean;

    @Prop({ default: null })
    completedDate: Date;

    @Prop({ default: [] })
    evidenceUrls: string[];

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
    reviewers: MongooseSchema.Types.ObjectId[];

    @Prop({ default: [] })
    reviews: {
        reviewer: MongooseSchema.Types.ObjectId;
        approved: boolean;
        feedback: string;
        timestamp: Date;
    }[];

    @Prop({ required: false })
    transactionHash: string;
}

@Schema({ timestamps: true })
export class Job extends Document {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    client: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    freelancer: MongooseSchema.Types.ObjectId;

    @Prop({ enum: JobStatus, default: JobStatus.DRAFT })
    status: JobStatus;

    @Prop({ type: [Milestone], default: [] })
    milestones: Milestone[];

    @Prop({ required: false })
    escrowAddress: string;

    @Prop({ required: false })
    contractAddress: string;

    @Prop({ default: 0 })
    totalAmount: number;

    @Prop({ default: 0 })
    totalPaid: number;

    @Prop({ default: [] })
    skills: string[];
}

export const JobSchema = SchemaFactory.createForClass(Job); 