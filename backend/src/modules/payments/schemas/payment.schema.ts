import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum PaymentStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

export enum PaymentType {
    MILESTONE = 'milestone',
    ESCROW = 'escrow',
    REFUND = 'refund'
}

@Schema({ timestamps: true })
export class Payment extends Document {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    sender: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    recipient: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Job', required: true })
    job: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    amount: number;

    @Prop({ required: false })
    milestoneIndex: number;

    @Prop({ required: true, enum: PaymentType })
    type: PaymentType;

    @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING })
    status: PaymentStatus;

    @Prop({ required: false })
    transactionHash: string;

    @Prop({ required: false })
    blockchainNetwork: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment); 