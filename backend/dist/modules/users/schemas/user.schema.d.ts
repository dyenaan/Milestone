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
export declare enum UserRole {
    CLIENT = "client",
    FREELANCER = "freelancer",
    REVIEWER = "reviewer",
    ADMIN = "admin"
}
export declare class User extends Document {
    username: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    walletAddress: string;
    bio: string;
    skills: string[];
    profilePicture: string;
    reputationScore: number;
    reputation: number;
    emailVerified: boolean;
    refreshToken: string;
    stellarPublicKey: string;
    socialProviderId: string;
    socialProvider: string;
    jobs: MongooseSchema.Types.ObjectId[];
    reviews: MongooseSchema.Types.ObjectId[];
    isReviewer: boolean;
    reviewerReputation: number;
    expertiseAreas: string[];
    totalReviewsDone: number;
    successfulReviewsCount: number;
}
export declare const UserSchema: MongooseSchema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User> & User & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
}>;
