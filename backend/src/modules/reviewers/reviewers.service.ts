import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from '../users/schemas/user.schema';
import { ReviewerApplication, ReviewerApplicationStatus } from './schemas/reviewer-application.schema';
import { ContractService } from '../blockchain/services/contract.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ReviewersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(ReviewerApplication.name) private reviewerApplicationModel: Model<ReviewerApplication>,
        private contractService: ContractService,
        private usersService: UsersService,
    ) { }

    async submitApplication(userId: string, applicationData: {
        motivation: string;
        expertiseAreas: string[];
        yearsOfExperience: number;
        portfolioUrl?: string;
        linkedinUrl?: string;
        githubUrl?: string;
        resumeUrl?: string;
    }): Promise<ReviewerApplication> {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Check if user already has a pending or approved application
        const existingApplication = await this.reviewerApplicationModel.findOne({
            user: userId,
            status: { $in: [ReviewerApplicationStatus.PENDING, ReviewerApplicationStatus.APPROVED] },
        });

        if (existingApplication) {
            throw new BadRequestException('User already has a pending or approved application');
        }

        const newApplication = new this.reviewerApplicationModel({
            user: userId,
            ...applicationData,
            status: ReviewerApplicationStatus.PENDING,
        });

        return newApplication.save();
    }

    async getApplications(status?: ReviewerApplicationStatus): Promise<ReviewerApplication[]> {
        const query = status ? { status } : {};
        return this.reviewerApplicationModel.find(query).populate('user').exec();
    }

    async getApplicationById(id: string): Promise<ReviewerApplication> {
        const application = await this.reviewerApplicationModel.findById(id).populate('user').exec();
        if (!application) {
            throw new NotFoundException('Application not found');
        }
        return application;
    }

    async reviewApplication(
        applicationId: string,
        adminId: string,
        approve: boolean,
        rejectionReason?: string,
    ): Promise<ReviewerApplication> {
        const application = await this.reviewerApplicationModel.findById(applicationId);
        if (!application) {
            throw new NotFoundException('Application not found');
        }

        if (application.status !== ReviewerApplicationStatus.PENDING) {
            throw new BadRequestException('Application is not pending');
        }

        const admin = await this.usersService.findById(adminId);
        if (!admin || admin.role !== UserRole.ADMIN) {
            throw new BadRequestException('Only admins can review applications');
        }

        if (approve) {
            application.status = ReviewerApplicationStatus.APPROVED;

            // Update user role and expertise areas
            await this.userModel.findByIdAndUpdate(
                application.user,
                {
                    $set: {
                        role: UserRole.REVIEWER,
                        isReviewer: true,
                        expertiseAreas: application.expertiseAreas
                    }
                }
            );

            // Register user as a reviewer on the blockchain
            const user = await this.usersService.findById(application.user);
            if (user && user.walletAddress) {
                try {
                    await this.contractService.registerAsReviewer(user.walletAddress);
                } catch (error) {
                    // If blockchain registration fails, we still approve them in our database
                    // but log the error
                    console.error('Failed to register reviewer on blockchain:', error);
                }
            }
        } else {
            application.status = ReviewerApplicationStatus.REJECTED;
            application.rejectionReason = rejectionReason;
        }

        application.reviewedBy = adminId;
        application.reviewedAt = new Date();

        return application.save();
    }

    async getActiveReviewers(): Promise<User[]> {
        return this.userModel.find({
            role: UserRole.REVIEWER,
            isReviewer: true,
        }).exec();
    }

    async getReviewersByExpertise(expertise: string): Promise<User[]> {
        return this.userModel.find({
            role: UserRole.REVIEWER,
            isReviewer: true,
            expertiseAreas: expertise,
        }).exec();
    }

    async updateReviewerStats(
        reviewerId: string,
        data: {
            reviewDone: boolean;
            successful?: boolean;
            reputationChange?: number;
        }
    ): Promise<User> {
        const reviewer = await this.usersService.findById(reviewerId);
        if (!reviewer || reviewer.role !== UserRole.REVIEWER) {
            throw new NotFoundException('Reviewer not found');
        }

        const update: any = { $inc: { totalReviewsDone: 1 } };

        if (data.successful) {
            update.$inc.successfulReviewsCount = 1;
        }

        if (data.reputationChange) {
            update.$inc.reviewerReputation = data.reputationChange;
        }

        return this.userModel.findByIdAndUpdate(reviewerId, update, { new: true }).exec();
    }

    async getTopReviewers(limit: number = 10): Promise<User[]> {
        return this.userModel.find({
            role: UserRole.REVIEWER,
            isReviewer: true,
        })
            .sort({ reviewerReputation: -1, totalReviewsDone: -1 })
            .limit(limit)
            .exec();
    }
} 