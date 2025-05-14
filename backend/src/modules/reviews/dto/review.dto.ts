import { ReviewStatus, ReviewType } from '../schemas/review.schema';
import { UserResponseDto } from '../../users/dto/user.dto';

export class CreateReviewDto {
    readonly target: string;
    readonly onModel: 'Job' | 'User' | 'Milestone';
    readonly type: ReviewType;
    readonly content: string;
    readonly rating?: number;
}

export class UpdateReviewDto {
    readonly status?: ReviewStatus;
    readonly content?: string;
    readonly rating?: number;
    readonly rewardAmount?: number;
    readonly rewardPaid?: boolean;
    readonly transactionHash?: string;
}

export class ReviewQueueDto {
    readonly jobId: string;
    readonly milestoneIndex: number;
}

export class RewardReviewerDto {
    readonly reviewId: string;
    readonly amount: number;
    readonly transactionHash?: string;
}

export class ReviewResponseDto {
    readonly id: string;
    readonly reviewer: UserResponseDto;
    readonly target: any;
    readonly onModel: string;
    readonly type: ReviewType;
    readonly status: ReviewStatus;
    readonly content: string;
    readonly rating?: number;
    readonly rewardAmount: number;
    readonly rewardPaid: boolean;
    readonly transactionHash?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
} 