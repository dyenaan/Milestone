import { ReviewStatus, ReviewType } from '../schemas/review.schema';
import { UserResponseDto } from '../../users/dto/user.dto';
export declare class CreateReviewDto {
    readonly target: string;
    readonly onModel: 'Job' | 'User' | 'Milestone';
    readonly type: ReviewType;
    readonly content: string;
    readonly rating?: number;
}
export declare class UpdateReviewDto {
    readonly status?: ReviewStatus;
    readonly content?: string;
    readonly rating?: number;
    readonly rewardAmount?: number;
    readonly rewardPaid?: boolean;
    readonly transactionHash?: string;
}
export declare class ReviewQueueDto {
    readonly jobId: string;
    readonly milestoneIndex: number;
}
export declare class RewardReviewerDto {
    readonly reviewId: string;
    readonly amount: number;
    readonly transactionHash?: string;
}
export declare class ReviewResponseDto {
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
