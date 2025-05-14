import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum UserRole {
    CLIENT = 'client',
    FREELANCER = 'freelancer',
    REVIEWER = 'reviewer',
    ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ required: true })
    username: string;

    @Prop({ required: false })
    name: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true, enum: UserRole, default: UserRole.CLIENT })
    role: UserRole;

    @Prop()
    walletAddress: string;

    @Prop()
    bio: string;

    @Prop({ type: [String] })
    skills: string[];

    @Prop()
    profilePicture: string;

    @Prop({ default: 0 })
    reputationScore: number;

    @Prop({ default: 0 })
    reputation: number;

    @Prop({ default: false })
    emailVerified: boolean;

    @Prop()
    refreshToken: string;

    @Prop({ required: false })
    stellarPublicKey: string;

    @Prop({ required: false })
    socialProviderId: string;

    @Prop({ required: false })
    socialProvider: string;

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Job' }] })
    jobs: MongooseSchema.Types.ObjectId[];

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Review' }] })
    reviews: MongooseSchema.Types.ObjectId[];

    // Specific for reviewers
    @Prop({ default: false })
    isReviewer: boolean;

    @Prop({ default: 0 })
    reviewerReputation: number;

    @Prop({ type: [String] })
    expertiseAreas: string[];

    @Prop({ default: 0 })
    totalReviewsDone: number;

    @Prop({ default: 0 })
    successfulReviewsCount: number;
}

export const UserSchema = SchemaFactory.createForClass(User); 