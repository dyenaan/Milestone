import { ReviewersService } from './reviewers.service';
import { ReviewerApplicationStatus } from './schemas/reviewer-application.schema';
export declare class ReviewersController {
    private readonly reviewersService;
    constructor(reviewersService: ReviewersService);
    applyAsReviewer(req: any, applicationData: {
        motivation: string;
        expertiseAreas: string[];
        yearsOfExperience: number;
        portfolioUrl?: string;
        linkedinUrl?: string;
        githubUrl?: string;
        resumeUrl?: string;
    }): Promise<import("./schemas/reviewer-application.schema").ReviewerApplication>;
    getMyApplication(req: any): Promise<import("./schemas/reviewer-application.schema").ReviewerApplication>;
    getAllApplications(status?: ReviewerApplicationStatus): Promise<import("./schemas/reviewer-application.schema").ReviewerApplication[]>;
    getApplicationById(id: string): Promise<import("./schemas/reviewer-application.schema").ReviewerApplication>;
    reviewApplication(req: any, id: string, reviewData: {
        approve: boolean;
        rejectionReason?: string;
    }): Promise<import("./schemas/reviewer-application.schema").ReviewerApplication>;
    getActiveReviewers(): Promise<import("../users/schemas/user.schema").User[]>;
    getReviewersByExpertise(expertise: string): Promise<import("../users/schemas/user.schema").User[]>;
    getTopReviewers(limit?: number): Promise<import("../users/schemas/user.schema").User[]>;
    updateReviewerStats(id: string, updateData: {
        reviewDone: boolean;
        successful?: boolean;
        reputationChange?: number;
    }): Promise<import("../users/schemas/user.schema").User>;
}
