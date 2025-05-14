import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export enum ReviewerApplicationStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class ReviewerApplication extends Document {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    user: User;

    @Prop({ required: true })
    motivation: string;

    @Prop({ type: [String], required: true })
    expertiseAreas: string[];

    @Prop({ required: true })
    yearsOfExperience: number;

    @Prop()
    portfolioUrl: string;

    @Prop()
    linkedinUrl: string;

    @Prop()
    githubUrl: string;

    @Prop()
    resumeUrl: string;

    @Prop({ enum: ReviewerApplicationStatus, default: ReviewerApplicationStatus.PENDING })
    status: ReviewerApplicationStatus;

    @Prop()
    rejectionReason: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    reviewedBy: User;

    @Prop()
    reviewedAt: Date;
}

export const ReviewerApplicationSchema = SchemaFactory.createForClass(ReviewerApplication); 