"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var JobsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const job_schema_1 = require("../schemas/job.schema");
const user_schema_1 = require("../../users/schemas/user.schema");
const notifications_service_1 = require("../../notifications/services/notifications.service");
const blockchain_service_1 = require("../../blockchain/services/blockchain.service");
const notification_schema_1 = require("../../notifications/schemas/notification.schema");
let JobsService = JobsService_1 = class JobsService {
    constructor(jobModel, userModel, notificationsService, blockchainService) {
        this.jobModel = jobModel;
        this.userModel = userModel;
        this.notificationsService = notificationsService;
        this.blockchainService = blockchainService;
        this.logger = new common_1.Logger(JobsService_1.name);
    }
    async findAll(status, skills) {
        let query = {};
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
    async findByClient(clientId) {
        return this.jobModel.find({ client: clientId })
            .populate('client', 'name email walletAddress reputation')
            .populate('freelancer', 'name email walletAddress reputation')
            .sort({ createdAt: -1 })
            .exec();
    }
    async findByFreelancer(freelancerId) {
        return this.jobModel.find({ freelancer: freelancerId })
            .populate('client', 'name email walletAddress reputation')
            .populate('freelancer', 'name email walletAddress reputation')
            .sort({ createdAt: -1 })
            .exec();
    }
    async findById(id) {
        const job = await this.jobModel.findById(id)
            .populate('client', 'name email walletAddress reputation')
            .populate('freelancer', 'name email walletAddress reputation')
            .exec();
        if (!job) {
            throw new common_1.NotFoundException(`Job with ID ${id} not found`);
        }
        return job;
    }
    async create(createJobDto, clientId) {
        this.logger.log(`Creating job for client: ${clientId}`);
        const client = await this.userModel.findById(clientId).exec();
        if (!client) {
            throw new common_1.NotFoundException(`Client with ID ${clientId} not found`);
        }
        if (client.role !== user_schema_1.UserRole.CLIENT) {
            throw new common_1.BadRequestException('Only clients can create jobs');
        }
        const totalAmount = createJobDto.milestones.reduce((total, milestone) => total + milestone.amount, 0);
        const newJob = new this.jobModel(Object.assign(Object.assign({}, createJobDto), { client: clientId, status: job_schema_1.JobStatus.DRAFT, totalAmount }));
        const savedJob = await newJob.save();
        const freelancers = await this.userModel.find({ role: user_schema_1.UserRole.FREELANCER }).exec();
        for (const freelancer of freelancers) {
            await this.notificationsService.createJobNotification(freelancer.id, notification_schema_1.NotificationType.NEW_JOB, savedJob.id, savedJob.title);
        }
        return savedJob;
    }
    async update(id, updateJobDto) {
        var _a;
        this.logger.log(`Updating job with ID: ${id}`);
        const job = await this.jobModel.findById(id).exec();
        if (!job) {
            throw new common_1.NotFoundException(`Job with ID ${id} not found`);
        }
        if (updateJobDto.freelancerId && ((_a = job.freelancer) === null || _a === void 0 ? void 0 : _a.toString()) !== updateJobDto.freelancerId) {
            const freelancer = await this.userModel.findById(updateJobDto.freelancerId).exec();
            if (!freelancer) {
                throw new common_1.NotFoundException(`Freelancer with ID ${updateJobDto.freelancerId} not found`);
            }
            if (freelancer.role !== user_schema_1.UserRole.FREELANCER) {
                throw new common_1.BadRequestException('Only freelancers can be assigned to jobs');
            }
            await this.notificationsService.createJobNotification(freelancer.id, notification_schema_1.NotificationType.JOB_ACCEPTED, job.id, job.title);
        }
        if (updateJobDto.status && updateJobDto.status !== job.status) {
            if (updateJobDto.status === job_schema_1.JobStatus.IN_PROGRESS && !job.freelancer) {
                throw new common_1.BadRequestException('Cannot start job without a freelancer');
            }
            if (updateJobDto.status === job_schema_1.JobStatus.COMPLETED) {
                const incompleteMilestones = job.milestones.filter(m => !m.isCompleted);
                if (incompleteMilestones.length > 0) {
                    throw new common_1.BadRequestException('Cannot complete job with incomplete milestones');
                }
            }
        }
        const updatedJob = await this.jobModel.findByIdAndUpdate(id, updateJobDto, { new: true })
            .populate('client', 'name email walletAddress reputation')
            .populate('freelancer', 'name email walletAddress reputation')
            .exec();
        return updatedJob;
    }
    async addMilestone(createMilestoneDto) {
        const { jobId, milestone } = createMilestoneDto;
        this.logger.log(`Adding milestone to job ${jobId}`);
        const job = await this.jobModel.findById(jobId).exec();
        if (!job) {
            throw new common_1.NotFoundException(`Job with ID ${jobId} not found`);
        }
        if (job.status !== job_schema_1.JobStatus.DRAFT) {
            throw new common_1.BadRequestException('Cannot add milestones to a job that is not in draft status');
        }
        job.milestones.push(milestone);
        job.totalAmount += milestone.amount;
        return job.save();
    }
    async updateMilestone(jobId, milestoneIndex, updateMilestoneDto) {
        this.logger.log(`Updating milestone ${milestoneIndex} of job ${jobId}`);
        const job = await this.jobModel.findById(jobId).exec();
        if (!job) {
            throw new common_1.NotFoundException(`Job with ID ${jobId} not found`);
        }
        if (milestoneIndex < 0 || milestoneIndex >= job.milestones.length) {
            throw new common_1.NotFoundException(`Milestone at index ${milestoneIndex} not found`);
        }
        if (job.status !== job_schema_1.JobStatus.DRAFT && job.status !== job_schema_1.JobStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException('Cannot update milestones for completed or cancelled jobs');
        }
        const milestone = job.milestones[milestoneIndex];
        if (updateMilestoneDto.amount && updateMilestoneDto.amount !== milestone.amount) {
            job.totalAmount = job.totalAmount - milestone.amount + updateMilestoneDto.amount;
        }
        Object.assign(milestone, updateMilestoneDto);
        return job.save();
    }
    async submitMilestone(submitMilestoneDto, freelancerId) {
        var _a;
        const { jobId, milestoneIndex, evidenceUrls } = submitMilestoneDto;
        this.logger.log(`Submitting milestone ${milestoneIndex} of job ${jobId}`);
        const job = await this.jobModel.findById(jobId).exec();
        if (!job) {
            throw new common_1.NotFoundException(`Job with ID ${jobId} not found`);
        }
        if (((_a = job.freelancer) === null || _a === void 0 ? void 0 : _a.toString()) !== freelancerId) {
            throw new common_1.BadRequestException('Only the assigned freelancer can submit work for this job');
        }
        if (job.status !== job_schema_1.JobStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException('Cannot submit work for jobs that are not in progress');
        }
        if (milestoneIndex < 0 || milestoneIndex >= job.milestones.length) {
            throw new common_1.NotFoundException(`Milestone at index ${milestoneIndex} not found`);
        }
        const milestone = job.milestones[milestoneIndex];
        if (milestone.isCompleted) {
            throw new common_1.BadRequestException('This milestone is already completed');
        }
        milestone.evidenceUrls = evidenceUrls;
        const evidenceHash = evidenceUrls.join(',');
        await this.blockchainService.submitWork({
            escrowId: job.escrowAddress || job.id,
            milestoneId: milestoneIndex,
            evidenceHash,
        });
        await this.notificationsService.createMilestoneNotification(job.client.toString(), notification_schema_1.NotificationType.MILESTONE_SUBMITTED, job.id, job.title, milestoneIndex, milestone.title);
        return job.save();
    }
    async assignReviewers(assignReviewersDto, clientId) {
        const { jobId, milestoneIndex, reviewerIds } = assignReviewersDto;
        this.logger.log(`Assigning reviewers to milestone ${milestoneIndex} of job ${jobId}`);
        const job = await this.jobModel.findById(jobId).exec();
        if (!job) {
            throw new common_1.NotFoundException(`Job with ID ${jobId} not found`);
        }
        if (job.client.toString() !== clientId) {
            throw new common_1.BadRequestException('Only the client can assign reviewers for this job');
        }
        if (job.status !== job_schema_1.JobStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException('Cannot assign reviewers for jobs that are not in progress');
        }
        if (milestoneIndex < 0 || milestoneIndex >= job.milestones.length) {
            throw new common_1.NotFoundException(`Milestone at index ${milestoneIndex} not found`);
        }
        const milestone = job.milestones[milestoneIndex];
        if (!milestone.evidenceUrls || milestone.evidenceUrls.length === 0) {
            throw new common_1.BadRequestException('Cannot assign reviewers to a milestone that has not been submitted');
        }
        const reviewers = await this.userModel.find({
            _id: { $in: reviewerIds },
            role: user_schema_1.UserRole.REVIEWER,
        }).exec();
        if (reviewers.length !== reviewerIds.length) {
            throw new common_1.BadRequestException('One or more reviewer IDs are invalid or not reviewers');
        }
        milestone.reviewers = reviewerIds;
        await this.blockchainService.assignReviewers({
            escrowId: job.escrowAddress || job.id,
            milestoneId: milestoneIndex,
            reviewerAddresses: reviewers.map(r => r.walletAddress),
        });
        for (const reviewer of reviewers) {
            await this.notificationsService.createMilestoneNotification(reviewer.id, notification_schema_1.NotificationType.MILESTONE_REVIEW_REQUESTED, job.id, job.title, milestoneIndex, milestone.title);
        }
        return job.save();
    }
    async voteMilestone(voteMilestoneDto, reviewerId) {
        const { jobId, milestoneIndex, approved, feedback } = voteMilestoneDto;
        this.logger.log(`Reviewer ${reviewerId} voting on milestone ${milestoneIndex} of job ${jobId}: ${approved ? 'Approved' : 'Rejected'}`);
        const job = await this.jobModel.findById(jobId).exec();
        if (!job) {
            throw new common_1.NotFoundException(`Job with ID ${jobId} not found`);
        }
        if (job.status !== job_schema_1.JobStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException('Cannot vote on jobs that are not in progress');
        }
        if (milestoneIndex < 0 || milestoneIndex >= job.milestones.length) {
            throw new common_1.NotFoundException(`Milestone at index ${milestoneIndex} not found`);
        }
        const milestone = job.milestones[milestoneIndex];
        if (!milestone.reviewers || !milestone.reviewers.includes(reviewerId)) {
            throw new common_1.BadRequestException('Only assigned reviewers can vote on this milestone');
        }
        const existingVoteIndex = milestone.reviews.findIndex(r => r.reviewer.toString() === reviewerId);
        const reviewer = await this.userModel.findById(reviewerId).exec();
        if (!reviewer) {
            throw new common_1.NotFoundException(`Reviewer with ID ${reviewerId} not found`);
        }
        const vote = {
            reviewer: reviewerId,
            approved,
            feedback,
            timestamp: new Date(),
        };
        if (existingVoteIndex >= 0) {
            milestone.reviews[existingVoteIndex] = vote;
        }
        else {
            milestone.reviews.push(vote);
        }
        await this.blockchainService.voteOnMilestone({
            escrowId: job.escrowAddress || job.id,
            milestoneId: milestoneIndex,
            vote: approved,
            reviewerAddress: reviewer.walletAddress,
        });
        if (milestone.reviews.length === milestone.reviewers.length) {
            const approvals = milestone.reviews.filter(r => r.approved).length;
            const threshold = Math.ceil(milestone.reviewers.length / 2);
            if (approvals >= threshold) {
                await this.notificationsService.createMilestoneNotification(job.freelancer.toString(), notification_schema_1.NotificationType.MILESTONE_APPROVED, job.id, job.title, milestoneIndex, milestone.title);
                await this.notificationsService.createMilestoneNotification(job.client.toString(), notification_schema_1.NotificationType.MILESTONE_APPROVED, job.id, job.title, milestoneIndex, milestone.title);
            }
            else {
                await this.notificationsService.createMilestoneNotification(job.freelancer.toString(), notification_schema_1.NotificationType.MILESTONE_REJECTED, job.id, job.title, milestoneIndex, milestone.title);
                await this.notificationsService.createMilestoneNotification(job.client.toString(), notification_schema_1.NotificationType.MILESTONE_REJECTED, job.id, job.title, milestoneIndex, milestone.title);
            }
        }
        return job.save();
    }
    async releaseMilestone(releaseMilestoneDto, clientId) {
        const { jobId, milestoneIndex } = releaseMilestoneDto;
        this.logger.log(`Releasing funds for milestone ${milestoneIndex} of job ${jobId}`);
        const job = await this.jobModel.findById(jobId).exec();
        if (!job) {
            throw new common_1.NotFoundException(`Job with ID ${jobId} not found`);
        }
        if (job.client.toString() !== clientId) {
            throw new common_1.BadRequestException('Only the client can release funds for this job');
        }
        if (job.status !== job_schema_1.JobStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException('Cannot release funds for jobs that are not in progress');
        }
        if (milestoneIndex < 0 || milestoneIndex >= job.milestones.length) {
            throw new common_1.NotFoundException(`Milestone at index ${milestoneIndex} not found`);
        }
        const milestone = job.milestones[milestoneIndex];
        if (milestone.isCompleted) {
            throw new common_1.BadRequestException('This milestone is already completed');
        }
        if (milestone.reviewers && milestone.reviewers.length > 0) {
            const approvals = milestone.reviews.filter(r => r.approved).length;
            const threshold = Math.ceil(milestone.reviewers.length / 2);
            if (approvals < threshold) {
                throw new common_1.BadRequestException('Not enough reviewers have approved this milestone');
            }
        }
        const txHash = await this.blockchainService.releaseFunds({
            escrowId: job.escrowAddress || job.id,
            milestoneId: milestoneIndex,
        });
        milestone.isCompleted = true;
        milestone.completedDate = new Date();
        milestone.transactionHash = txHash;
        job.totalPaid += milestone.amount;
        const incompleteMilestones = job.milestones.filter(m => !m.isCompleted);
        if (incompleteMilestones.length === 0) {
            job.status = job_schema_1.JobStatus.COMPLETED;
        }
        await this.notificationsService.createMilestoneNotification(job.freelancer.toString(), notification_schema_1.NotificationType.PAYMENT_RELEASED, job.id, job.title, milestoneIndex, milestone.title);
        if (milestone.reviewers && milestone.reviewers.length > 0) {
            for (const reviewerId of milestone.reviewers) {
                const rewardAmount = 5;
                await this.notificationsService.createReviewerNotification(reviewerId.toString(), notification_schema_1.NotificationType.REVIEWER_REWARDED, rewardAmount, txHash);
            }
        }
        return job.save();
    }
    async remove(id) {
        this.logger.log(`Removing job with ID: ${id}`);
        const job = await this.jobModel.findById(id).exec();
        if (!job) {
            throw new common_1.NotFoundException(`Job with ID ${id} not found`);
        }
        if (job.status !== job_schema_1.JobStatus.DRAFT) {
            throw new common_1.BadRequestException('Cannot delete jobs that are not in draft status');
        }
        await this.jobModel.deleteOne({ _id: id }).exec();
    }
};
JobsService = JobsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(job_schema_1.Job.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        notifications_service_1.NotificationsService,
        blockchain_service_1.BlockchainService])
], JobsService);
exports.JobsService = JobsService;
//# sourceMappingURL=jobs.service.js.map