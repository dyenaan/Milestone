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
export declare enum JobStatus {
    DRAFT = "draft",
    OPEN = "open",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare class Milestone {
    title: string;
    description: string;
    amount: number;
    dueDate: Date;
    isCompleted: boolean;
    completedDate: Date;
    evidenceUrls: string[];
    reviewers: MongooseSchema.Types.ObjectId[];
    reviews: {
        reviewer: MongooseSchema.Types.ObjectId;
        approved: boolean;
        feedback: string;
        timestamp: Date;
    }[];
    transactionHash: string;
}
export declare class Job extends Document {
    title: string;
    description: string;
    client: MongooseSchema.Types.ObjectId;
    freelancer: MongooseSchema.Types.ObjectId;
    status: JobStatus;
    milestones: Milestone[];
    escrowAddress: string;
    contractAddress: string;
    totalAmount: number;
    totalPaid: number;
    skills: string[];
}
export declare const JobSchema: MongooseSchema<Job, import("mongoose").Model<Job, any, any, any, Document<unknown, any, Job> & Job & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Job, Document<unknown, {}, import("mongoose").FlatRecord<Job>> & import("mongoose").FlatRecord<Job> & {
    _id: import("mongoose").Types.ObjectId;
}>;
