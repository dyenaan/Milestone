import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { ReviewerApplication, ReviewerApplicationStatus } from './schemas/reviewer-application.schema';
import { ContractService } from '../blockchain/services/contract.service';
import { UsersService } from '../users/users.service';
export declare class ReviewersService {
    private userModel;
    private reviewerApplicationModel;
    private contractService;
    private usersService;
    constructor(userModel: Model<User>, reviewerApplicationModel: Model<ReviewerApplication>, contractService: ContractService, usersService: UsersService);
    submitApplication(userId: string, applicationData: {
        motivation: string;
        expertiseAreas: string[];
        yearsOfExperience: number;
        portfolioUrl?: string;
        linkedinUrl?: string;
        githubUrl?: string;
        resumeUrl?: string;
    }): Promise<ReviewerApplication>;
    getApplications(status?: ReviewerApplicationStatus): Promise<ReviewerApplication[]>;
    getApplicationById(id: string): Promise<ReviewerApplication>;
    reviewApplication(applicationId: string, adminId: string, approve: boolean, rejectionReason?: string): Promise<ReviewerApplication>;
    getActiveReviewers(): Promise<User[]>;
    getReviewersByExpertise(expertise: string): Promise<User[]>;
    updateReviewerStats(reviewerId: string, data: {
        reviewDone: boolean;
        successful?: boolean;
        reputationChange?: number;
    }): Promise<User>;
    getTopReviewers(limit?: number): Promise<User[]>;
}
