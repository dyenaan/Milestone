import { JobStatus } from '../schemas/job.schema';
import { UserResponseDto } from '../../users/dto/user.dto';
export declare class MilestoneDto {
    readonly title: string;
    readonly description: string;
    readonly amount: number;
    readonly dueDate?: Date;
}
export declare class CreateJobDto {
    readonly title: string;
    readonly description: string;
    readonly skills?: string[];
    readonly milestones: MilestoneDto[];
}
export declare class UpdateJobDto {
    readonly title?: string;
    readonly description?: string;
    readonly status?: JobStatus;
    readonly freelancerId?: string;
    readonly escrowAddress?: string;
    readonly contractAddress?: string;
    readonly skills?: string[];
}
export declare class CreateMilestoneDto {
    readonly jobId: string;
    readonly milestone: MilestoneDto;
}
export declare class UpdateMilestoneDto {
    readonly title?: string;
    readonly description?: string;
    readonly amount?: number;
    readonly dueDate?: Date;
    readonly isCompleted?: boolean;
    readonly evidenceUrls?: string[];
}
export declare class SubmitMilestoneDto {
    readonly jobId: string;
    readonly milestoneIndex: number;
    readonly evidenceUrls: string[];
}
export declare class AssignReviewersDto {
    readonly jobId: string;
    readonly milestoneIndex: number;
    readonly reviewerIds: string[];
}
export declare class VoteMilestoneDto {
    readonly jobId: string;
    readonly milestoneIndex: number;
    readonly approved: boolean;
    readonly feedback: string;
}
export declare class ReleaseMilestoneDto {
    readonly jobId: string;
    readonly milestoneIndex: number;
    readonly transactionHash?: string;
}
export declare class MilestoneResponseDto {
    readonly title: string;
    readonly description: string;
    readonly amount: number;
    readonly dueDate?: Date;
    readonly isCompleted: boolean;
    readonly completedDate?: Date;
    readonly evidenceUrls: string[];
    readonly reviewers: UserResponseDto[];
    readonly reviews: {
        reviewer: UserResponseDto;
        approved: boolean;
        feedback: string;
        timestamp: Date;
    }[];
    readonly transactionHash?: string;
}
export declare class JobResponseDto {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly client: UserResponseDto;
    readonly freelancer?: UserResponseDto;
    readonly status: JobStatus;
    readonly milestones: MilestoneResponseDto[];
    readonly escrowAddress?: string;
    readonly contractAddress?: string;
    readonly totalAmount: number;
    readonly totalPaid: number;
    readonly skills: string[];
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
