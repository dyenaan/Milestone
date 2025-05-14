/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import { Document, Schema as MongooseSchema } from 'mongoose';
export declare enum NotificationType {
    NEW_JOB = "new_job",
    JOB_ACCEPTED = "job_accepted",
    MILESTONE_SUBMITTED = "milestone_submitted",
    MILESTONE_REVIEW_REQUESTED = "milestone_review_requested",
    MILESTONE_APPROVED = "milestone_approved",
    MILESTONE_REJECTED = "milestone_rejected",
    PAYMENT_RELEASED = "payment_released",
    REVIEWER_ASSIGNED = "reviewer_assigned",
    REVIEWER_REWARDED = "reviewer_rewarded"
}
export declare class Notification extends Document {
    recipient: MongooseSchema.Types.ObjectId;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    reference: MongooseSchema.Types.ObjectId;
    referenceModel: string;
    metadata: Record<string, any>;
}
export declare const NotificationSchema: MongooseSchema<Notification, import("mongoose").Model<Notification, any, any, any, Document<unknown, any, Notification> & Notification & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Notification, Document<unknown, {}, import("mongoose").FlatRecord<Notification>> & import("mongoose").FlatRecord<Notification> & {
    _id: import("mongoose").Types.ObjectId;
}>;
