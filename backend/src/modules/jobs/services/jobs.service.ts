import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobStatus } from '../schemas/job.schema';
import { User, UserRole } from '../../users/schemas/user.schema';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { BlockchainService } from '../../blockchain/services/blockchain.service';
import { NotificationType } from '../../notifications/schemas/notification.schema';
import {
    CreateJobDto,
    UpdateJobDto,
    CreateMilestoneDto,
    UpdateMilestoneDto,
    SubmitMilestoneDto,
    AssignReviewersDto,
    VoteMilestoneDto,
    ReleaseMilestoneDto,
} from '../dto/job.dto';

@Injectable()
export class JobsService {
    private readonly logger = new Logger(JobsService.name);

    constructor(
        @InjectModel(Job.name) private jobModel: Model<Job>,
        @InjectModel(User.name) private userModel: Model<User>,
        private notificationsService: NotificationsService,
        private blockchainService: BlockchainService,
    ) { }

    /**
     * Find all jobs
     */
    async findAll(status?: JobStatus, skills?: string[]): Promise<Job[]> {
        let query: any = {};

        if (status) {
            query.status = status;
        }

        if (skills && skills.length > 0) {
            query.skills = { $in: skills };
        }

        return this.jobModel.find(query)
            .populate('client', 'name email walletAddress reputation')
            .populate('freelancer', 'name email walletAddress reputation')
            .sort({ createdAt: -1 })
            .exec();
    }

    /**
     * Find jobs by client
     */
    async findByClient(clientId: string): Promise<Job[]> {
        return this.jobModel.find({ client: clientId })
            .populate('client', 'name email walletAddress reputation')
            .populate('freelancer', 'name email walletAddress reputation')
            .sort({ createdAt: -1 })
            .exec();
    }

    /**
     * Find jobs by freelancer
     */
    async findByFreelancer(freelancerId: string): Promise<Job[]> {
        return this.jobModel.find({ freelancer: freelancerId })
            .populate('client', 'name email walletAddress reputation')
            .populate('freelancer', 'name email walletAddress reputation')
            .sort({ createdAt: -1 })
            .exec();
    }

    /**
     * Find a job by ID
     */
    async findById(id: string): Promise<Job> {
        const job = await this.jobModel.findById(id)
            .populate('client', 'name email walletAddress reputation')
            .populate('freelancer', 'name email walletAddress reputation')
            .exec();

        if (!job) {
            throw new NotFoundException(`Job with ID ${id} not found`);
        }

        return job;
    }

    /**
     * Create a new job
     */
    async create(createJobDto: CreateJobDto, clientId: string): Promise<Job> {
        this.logger.log(`Creating job for client: ${clientId}`);

        const client = await this.userModel.findById(clientId).exec();
        if (!client) {
            throw new NotFoundException(`Client with ID ${clientId} not found`);
        }

        if (client.role !== UserRole.CLIENT) {
            throw new BadRequestException('Only clients can create jobs');
        }

        const totalAmount = createJobDto.milestones.reduce((total, milestone) => total + milestone.amount, 0);

        const newJob = new this.jobModel({
            ...createJobDto,
            client: clientId,
            status: JobStatus.DRAFT,
            totalAmount,
        });

        const savedJob = await newJob.save();

        // Notify all freelancers about the new job
        const freelancers = await this.userModel.find({ role: UserRole.FREELANCER }).exec();

        for (const freelancer of freelancers) {
            await this.notificationsService.createJobNotification(
                freelancer.id,
                NotificationType.NEW_JOB,
                savedJob.id,
                savedJob.title,
            );
        }

        return savedJob;
    }

    /**
     * Update a job
     */
    async update(id: string, updateJobDto: UpdateJobDto): Promise<Job> {
        this.logger.log(`Updating job with ID: ${id}`);

        const job = await this.jobModel.findById(id).exec();
        if (!job) {
            throw new NotFoundException(`Job with ID ${id} not found`);
        }

        // Handle freelancer assignment
        if (updateJobDto.freelancerId && job.freelancer?.toString() !== updateJobDto.freelancerId) {
            const freelancer = await this.userModel.findById(updateJobDto.freelancerId).exec();
            if (!freelancer) {
                throw new NotFoundException(`Freelancer with ID ${updateJobDto.freelancerId} not found`);
            }

            if (freelancer.role !== UserRole.FREELANCER) {
                throw new BadRequestException('Only freelancers can be assigned to jobs');
            }

            // Notify the freelancer about the assignment
            await this.notificationsService.createJobNotification(
                freelancer.id,
                NotificationType.JOB_ACCEPTED,
                job.id,
                job.title,
            );
        }

        // Handle job status changes
        if (updateJobDto.status && updateJobDto.status !== job.status) {
            if (updateJobDto.status === JobStatus.IN_PROGRESS && !job.freelancer) {
                throw new BadRequestException('Cannot start job without a freelancer');
            }

            if (updateJobDto.status === JobStatus.COMPLETED) {
                const incompleteMilestones = job.milestones.filter(m => !m.isCompleted);
                if (incompleteMilestones.length > 0) {
                    throw new BadRequestException('Cannot complete job with incomplete milestones');
                }
            }
        }

        const updatedJob = await this.jobModel.findByIdAndUpdate(
            id,
            updateJobDto,
            { new: true },
        )
            .populate('client', 'name email walletAddress reputation')
            .populate('freelancer', 'name email walletAddress reputation')
            .exec();

        return updatedJob;
    }

    /**
     * Add a milestone to a job
     */
    async addMilestone(createMilestoneDto: CreateMilestoneDto): Promise<Job> {
        const { jobId, milestone } = createMilestoneDto;

        this.logger.log(`Adding milestone to job ${jobId}`);

        const job = await this.jobModel.findById(jobId).exec();
        if (!job) {
            throw new NotFoundException(`Job with ID ${jobId} not found`);
        }

        if (job.status !== JobStatus.DRAFT) {
            throw new BadRequestException('Cannot add milestones to a job that is not in draft status');
        }

        job.milestones.push(milestone);
        job.totalAmount += milestone.amount;

        return job.save();
    }

    /**
     * Update a milestone
     */
    async updateMilestone(jobId: string, milestoneIndex: number, updateMilestoneDto: UpdateMilestoneDto): Promise<Job> {
        this.logger.log(`Updating milestone ${milestoneIndex} of job ${jobId}`);

        const job = await this.jobModel.findById(jobId).exec();
        if (!job) {
            throw new NotFoundException(`Job with ID ${jobId} not found`);
        }

        if (milestoneIndex < 0 || milestoneIndex >= job.milestones.length) {
            throw new NotFoundException(`Milestone at index ${milestoneIndex} not found`);
        }

        if (job.status !== JobStatus.DRAFT && job.status !== JobStatus.IN_PROGRESS) {
            throw new BadRequestException('Cannot update milestones for completed or cancelled jobs');
        }

        const milestone = job.milestones[milestoneIndex];

        if (updateMilestoneDto.amount && updateMilestoneDto.amount !== milestone.amount) {
            job.totalAmount = job.totalAmount - milestone.amount + updateMilestoneDto.amount;
        }

        Object.assign(milestone, updateMilestoneDto);

        return job.save();
    }

    /**
     * Submit work for a milestone
     */
    async submitMilestone(submitMilestoneDto: SubmitMilestoneDto, freelancerId: string): Promise<Job> {
        const { jobId, milestoneIndex, evidenceUrls } = submitMilestoneDto;

        this.logger.log(`Submitting milestone ${milestoneIndex} of job ${jobId}`);

        const job = await this.jobModel.findById(jobId).exec();
        if (!job) {
            throw new NotFoundException(`Job with ID ${jobId} not found`);
        }

        if (job.freelancer?.toString() !== freelancerId) {
            throw new BadRequestException('Only the assigned freelancer can submit work for this job');
        }

        if (job.status !== JobStatus.IN_PROGRESS) {
            throw new BadRequestException('Cannot submit work for jobs that are not in progress');
        }

        if (milestoneIndex < 0 || milestoneIndex >= job.milestones.length) {
            throw new NotFoundException(`Milestone at index ${milestoneIndex} not found`);
        }

        const milestone = job.milestones[milestoneIndex];

        if (milestone.isCompleted) {
            throw new BadRequestException('This milestone is already completed');
        }

        milestone.evidenceUrls = evidenceUrls;

        // Submit work to blockchain
        const evidenceHash = evidenceUrls.join(','); // Simplified
        await this.blockchainService.submitWork({
            escrowId: job.escrowAddress || job.id,
            milestoneId: milestoneIndex,
            evidenceHash,
        });

        // Notify the client
        await this.notificationsService.createMilestoneNotification(
            job.client.toString(),
            NotificationType.MILESTONE_SUBMITTED,
            job.id,
            job.title,
            milestoneIndex,
            milestone.title,
        );

        return job.save();
    }

    /**
     * Assign reviewers to a milestone
     */
    async assignReviewers(assignReviewersDto: AssignReviewersDto, clientId: string): Promise<Job> {
        const { jobId, milestoneIndex, reviewerIds } = assignReviewersDto;

        this.logger.log(`Assigning reviewers to milestone ${milestoneIndex} of job ${jobId}`);

        const job = await this.jobModel.findById(jobId).exec();
        if (!job) {
            throw new NotFoundException(`Job with ID ${jobId} not found`);
        }

        if (job.client.toString() !== clientId) {
            throw new BadRequestException('Only the client can assign reviewers for this job');
        }

        if (job.status !== JobStatus.IN_PROGRESS) {
            throw new BadRequestException('Cannot assign reviewers for jobs that are not in progress');
        }

        if (milestoneIndex < 0 || milestoneIndex >= job.milestones.length) {
            throw new NotFoundException(`Milestone at index ${milestoneIndex} not found`);
        }

        const milestone = job.milestones[milestoneIndex];

        if (!milestone.evidenceUrls || milestone.evidenceUrls.length === 0) {
            throw new BadRequestException('Cannot assign reviewers to a milestone that has not been submitted');
        }

        // Verify reviewers exist and have the reviewer role
        const reviewers = await this.userModel.find({
            _id: { $in: reviewerIds },
            role: UserRole.REVIEWER,
        }).exec();

        if (reviewers.length !== reviewerIds.length) {
            throw new BadRequestException('One or more reviewer IDs are invalid or not reviewers');
        }

        milestone.reviewers = reviewerIds;

        // Assign reviewers on blockchain
        await this.blockchainService.assignReviewers({
            escrowId: job.escrowAddress || job.id,
            milestoneId: milestoneIndex,
            reviewerAddresses: reviewers.map(r => r.walletAddress),
        });

        // Notify reviewers
        for (const reviewer of reviewers) {
            await this.notificationsService.createMilestoneNotification(
                reviewer.id,
                NotificationType.MILESTONE_REVIEW_REQUESTED,
                job.id,
                job.title,
                milestoneIndex,
                milestone.title,
            );
        }

        return job.save();
    }

    /**
     * Vote on a milestone
     */
    async voteMilestone(voteMilestoneDto: VoteMilestoneDto, reviewerId: string): Promise<Job> {
        const { jobId, milestoneIndex, approved, feedback } = voteMilestoneDto;

        this.logger.log(`Reviewer ${reviewerId} voting on milestone ${milestoneIndex} of job ${jobId}: ${approved ? 'Approved' : 'Rejected'}`);

        const job = await this.jobModel.findById(jobId).exec();
        if (!job) {
            throw new NotFoundException(`Job with ID ${jobId} not found`);
        }

        if (job.status !== JobStatus.IN_PROGRESS) {
            throw new BadRequestException('Cannot vote on jobs that are not in progress');
        }

        if (milestoneIndex < 0 || milestoneIndex >= job.milestones.length) {
            throw new NotFoundException(`Milestone at index ${milestoneIndex} not found`);
        }

        const milestone = job.milestones[milestoneIndex];

        if (!milestone.reviewers || !milestone.reviewers.includes(reviewerId)) {
            throw new BadRequestException('Only assigned reviewers can vote on this milestone');
        }

        // Check if the reviewer has already voted
        const existingVoteIndex = milestone.reviews.findIndex(
            r => r.reviewer.toString() === reviewerId
        );

        const reviewer = await this.userModel.findById(reviewerId).exec();
        if (!reviewer) {
            throw new NotFoundException(`Reviewer with ID ${reviewerId} not found`);
        }

        const vote = {
            reviewer: reviewerId,
            approved,
            feedback,
            timestamp: new Date(),
        };

        if (existingVoteIndex >= 0) {
            milestone.reviews[existingVoteIndex] = vote;
        } else {
            milestone.reviews.push(vote);
        }

        // Submit vote to blockchain
        await this.blockchainService.voteOnMilestone({
            escrowId: job.escrowAddress || job.id,
            milestoneId: milestoneIndex,
            vote: approved,
            reviewerAddress: reviewer.walletAddress,
        });

        // Check if milestone should be marked as completed
        if (milestone.reviews.length === milestone.reviewers.length) {
            const approvals = milestone.reviews.filter(r => r.approved).length;
            const threshold = Math.ceil(milestone.reviewers.length / 2); // Simple majority

            if (approvals >= threshold) {
                // Milestone is approved
                await this.notificationsService.createMilestoneNotification(
                    job.freelancer.toString(),
                    NotificationType.MILESTONE_APPROVED,
                    job.id,
                    job.title,
                    milestoneIndex,
                    milestone.title,
                );

                await this.notificationsService.createMilestoneNotification(
                    job.client.toString(),
                    NotificationType.MILESTONE_APPROVED,
                    job.id,
                    job.title,
                    milestoneIndex,
                    milestone.title,
                );
            } else {
                // Milestone is rejected
                await this.notificationsService.createMilestoneNotification(
                    job.freelancer.toString(),
                    NotificationType.MILESTONE_REJECTED,
                    job.id,
                    job.title,
                    milestoneIndex,
                    milestone.title,
                );

                await this.notificationsService.createMilestoneNotification(
                    job.client.toString(),
                    NotificationType.MILESTONE_REJECTED,
                    job.id,
                    job.title,
                    milestoneIndex,
                    milestone.title,
                );
            }
        }

        return job.save();
    }

    /**
     * Release funds for a milestone
     */
    async releaseMilestone(releaseMilestoneDto: ReleaseMilestoneDto, clientId: string): Promise<Job> {
        const { jobId, milestoneIndex } = releaseMilestoneDto;

        this.logger.log(`Releasing funds for milestone ${milestoneIndex} of job ${jobId}`);

        const job = await this.jobModel.findById(jobId).exec();
        if (!job) {
            throw new NotFoundException(`Job with ID ${jobId} not found`);
        }

        if (job.client.toString() !== clientId) {
            throw new BadRequestException('Only the client can release funds for this job');
        }

        if (job.status !== JobStatus.IN_PROGRESS) {
            throw new BadRequestException('Cannot release funds for jobs that are not in progress');
        }

        if (milestoneIndex < 0 || milestoneIndex >= job.milestones.length) {
            throw new NotFoundException(`Milestone at index ${milestoneIndex} not found`);
        }

        const milestone = job.milestones[milestoneIndex];

        if (milestone.isCompleted) {
            throw new BadRequestException('This milestone is already completed');
        }

        // Check if enough reviewers have approved
        if (milestone.reviewers && milestone.reviewers.length > 0) {
            const approvals = milestone.reviews.filter(r => r.approved).length;
            const threshold = Math.ceil(milestone.reviewers.length / 2); // Simple majority

            if (approvals < threshold) {
                throw new BadRequestException('Not enough reviewers have approved this milestone');
            }
        }

        // Release funds on blockchain
        const txHash = await this.blockchainService.releaseFunds({
            escrowId: job.escrowAddress || job.id,
            milestoneId: milestoneIndex,
        });

        milestone.isCompleted = true;
        milestone.completedDate = new Date();
        milestone.transactionHash = txHash;

        job.totalPaid += milestone.amount;

        // Check if job is completed
        const incompleteMilestones = job.milestones.filter(m => !m.isCompleted);
        if (incompleteMilestones.length === 0) {
            job.status = JobStatus.COMPLETED;
        }

        // Notify freelancer about payment
        await this.notificationsService.createMilestoneNotification(
            job.freelancer.toString(),
            NotificationType.PAYMENT_RELEASED,
            job.id,
            job.title,
            milestoneIndex,
            milestone.title,
        );

        // Reward reviewers (in a real implementation)
        if (milestone.reviewers && milestone.reviewers.length > 0) {
            for (const reviewerId of milestone.reviewers) {
                // In a real implementation, the reward amount would be calculated
                const rewardAmount = 5; // Example fixed amount

                await this.notificationsService.createReviewerNotification(
                    reviewerId.toString(),
                    NotificationType.REVIEWER_REWARDED,
                    rewardAmount,
                    txHash,
                );
            }
        }

        return job.save();
    }

    /**
     * Delete a job
     */
    async remove(id: string): Promise<void> {
        this.logger.log(`Removing job with ID: ${id}`);

        const job = await this.jobModel.findById(id).exec();
        if (!job) {
            throw new NotFoundException(`Job with ID ${id} not found`);
        }

        if (job.status !== JobStatus.DRAFT) {
            throw new BadRequestException('Cannot delete jobs that are not in draft status');
        }

        await this.jobModel.deleteOne({ _id: id }).exec();
    }
} 