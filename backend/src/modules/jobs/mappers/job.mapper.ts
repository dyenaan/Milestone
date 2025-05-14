import { Job } from '../schemas/job.schema';
import { JobResponseDto, MilestoneResponseDto } from '../dto/job.dto';

export class JobMapper {
    /**
     * Convert Job entity to JobResponseDto
     */
    static toDto(job: Job): JobResponseDto {
        // Handle case where job might be null
        if (!job) return null;

        const milestones = job.milestones?.map(milestone => ({
            title: milestone.title,
            description: milestone.description,
            amount: milestone.amount,
            dueDate: milestone.dueDate,
            isCompleted: milestone.isCompleted,
            completedDate: milestone.completedDate,
            evidenceUrls: milestone.evidenceUrls || [],
            // Convert ObjectId references to DTOs or map them to appropriate structure
            reviewers: Array.isArray(milestone.reviewers)
                ? milestone.reviewers.map(reviewer => ({
                    id: reviewer.toString(), // Convert ObjectId to string
                    // Add other fields as needed
                }))
                : [],
            reviews: Array.isArray(milestone.reviews)
                ? milestone.reviews.map(review => ({
                    reviewer: {
                        id: review.reviewer.toString(),
                        // Add other fields as needed
                    },
                    approved: review.approved,
                    feedback: review.feedback,
                    timestamp: review.timestamp,
                }))
                : [],
            transactionHash: milestone.transactionHash,
        } as MilestoneResponseDto)) || [];

        return {
            id: job._id.toString(),
            title: job.title,
            description: job.description,
            client: job.client ? {
                id: typeof job.client === 'string' ? job.client : job.client._id?.toString(),
                name: typeof job.client === 'object' ? job.client.name : undefined,
                email: typeof job.client === 'object' ? job.client.email : undefined,
                walletAddress: typeof job.client === 'object' ? job.client.walletAddress : undefined,
                reputation: typeof job.client === 'object' ? job.client.reputation : undefined,
            } : null,
            freelancer: job.freelancer ? {
                id: typeof job.freelancer === 'string' ? job.freelancer : job.freelancer._id?.toString(),
                name: typeof job.freelancer === 'object' ? job.freelancer.name : undefined,
                email: typeof job.freelancer === 'object' ? job.freelancer.email : undefined,
                walletAddress: typeof job.freelancer === 'object' ? job.freelancer.walletAddress : undefined,
                reputation: typeof job.freelancer === 'object' ? job.freelancer.reputation : undefined,
            } : null,
            status: job.status,
            milestones: milestones,
            escrowAddress: job.escrowAddress,
            contractAddress: job.contractAddress,
            totalAmount: job.totalAmount,
            totalPaid: job.totalPaid || 0,
            skills: job.skills || [],
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
        };
    }

    /**
     * Convert Job entity array to JobResponseDto array
     */
    static toDtoList(jobs: Job[]): JobResponseDto[] {
        return jobs.map(job => this.toDto(job));
    }
} 