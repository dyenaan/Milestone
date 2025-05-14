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
import { User } from '../../users/schemas/user.schema';
export declare enum ReviewerApplicationStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class ReviewerApplication extends Document {
    user: User;
    motivation: string;
    expertiseAreas: string[];
    yearsOfExperience: number;
    portfolioUrl: string;
    linkedinUrl: string;
    githubUrl: string;
    resumeUrl: string;
    status: ReviewerApplicationStatus;
    rejectionReason: string;
    reviewedBy: User;
    reviewedAt: Date;
}
export declare const ReviewerApplicationSchema: MongooseSchema<ReviewerApplication, import("mongoose").Model<ReviewerApplication, any, any, any, Document<unknown, any, ReviewerApplication> & ReviewerApplication & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ReviewerApplication, Document<unknown, {}, import("mongoose").FlatRecord<ReviewerApplication>> & import("mongoose").FlatRecord<ReviewerApplication> & {
    _id: import("mongoose").Types.ObjectId;
}>;
