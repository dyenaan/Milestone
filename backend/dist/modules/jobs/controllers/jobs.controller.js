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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsController = void 0;
const common_1 = require("@nestjs/common");
const jobs_service_1 = require("../services/jobs.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const job_schema_1 = require("../schemas/job.schema");
const job_dto_1 = require("../dto/job.dto");
const user_schema_1 = require("../../users/schemas/user.schema");
const job_mapper_1 = require("../mappers/job.mapper");
let JobsController = class JobsController {
    constructor(jobsService) {
        this.jobsService = jobsService;
    }
    async findAll(status, skills) {
        const skillsArray = skills ? skills.split(',') : undefined;
        const jobs = await this.jobsService.findAll(status, skillsArray);
        return job_mapper_1.JobMapper.toDtoList(jobs);
    }
    async findByClient(req) {
        const clientId = req.user['userId'];
        const jobs = await this.jobsService.findByClient(clientId);
        return job_mapper_1.JobMapper.toDtoList(jobs);
    }
    async findByFreelancer(req) {
        const freelancerId = req.user['userId'];
        const jobs = await this.jobsService.findByFreelancer(freelancerId);
        return job_mapper_1.JobMapper.toDtoList(jobs);
    }
    async findOne(id) {
        const job = await this.jobsService.findById(id);
        return job_mapper_1.JobMapper.toDto(job);
    }
    async create(createJobDto, req) {
        const clientId = req.user['userId'];
        const role = req.user['role'];
        if (role !== user_schema_1.UserRole.CLIENT) {
            throw new Error('Only clients can create jobs');
        }
        const job = await this.jobsService.create(createJobDto, clientId);
        return job_mapper_1.JobMapper.toDto(job);
    }
    async update(id, updateJobDto, req) {
        const userId = req.user['userId'];
        const role = req.user['role'];
        const job = await this.jobsService.findById(id);
        if (job.client.toString() !== userId && role !== user_schema_1.UserRole.CLIENT) {
            throw new Error('Unauthorized to update this job');
        }
        const updatedJob = await this.jobsService.update(id, updateJobDto);
        return job_mapper_1.JobMapper.toDto(updatedJob);
    }
    async addMilestone(createMilestoneDto, req) {
        const userId = req.user['userId'];
        const role = req.user['role'];
        const job = await this.jobsService.findById(createMilestoneDto.jobId);
        if (job.client.toString() !== userId && role !== user_schema_1.UserRole.CLIENT) {
            throw new Error('Unauthorized to add milestones to this job');
        }
        const updatedJob = await this.jobsService.addMilestone(createMilestoneDto);
        return job_mapper_1.JobMapper.toDto(updatedJob);
    }
    async updateMilestone(jobId, milestoneIndex, updateMilestoneDto, req) {
        const userId = req.user['userId'];
        const role = req.user['role'];
        const job = await this.jobsService.findById(jobId);
        if (job.client.toString() !== userId && role !== user_schema_1.UserRole.CLIENT) {
            throw new Error('Unauthorized to update milestones for this job');
        }
        const updatedJob = await this.jobsService.updateMilestone(jobId, milestoneIndex, updateMilestoneDto);
        return job_mapper_1.JobMapper.toDto(updatedJob);
    }
    async submitMilestone(submitMilestoneDto, req) {
        const freelancerId = req.user['userId'];
        const updatedJob = await this.jobsService.submitMilestone(submitMilestoneDto, freelancerId);
        return job_mapper_1.JobMapper.toDto(updatedJob);
    }
    async assignReviewers(assignReviewersDto, req) {
        const clientId = req.user['userId'];
        const updatedJob = await this.jobsService.assignReviewers(assignReviewersDto, clientId);
        return job_mapper_1.JobMapper.toDto(updatedJob);
    }
    async voteMilestone(voteMilestoneDto, req) {
        const reviewerId = req.user['userId'];
        const role = req.user['role'];
        if (role !== user_schema_1.UserRole.REVIEWER) {
            throw new Error('Only reviewers can vote on milestones');
        }
        const updatedJob = await this.jobsService.voteMilestone(voteMilestoneDto, reviewerId);
        return job_mapper_1.JobMapper.toDto(updatedJob);
    }
    async releaseMilestone(releaseMilestoneDto, req) {
        const clientId = req.user['userId'];
        const role = req.user['role'];
        if (role !== user_schema_1.UserRole.CLIENT) {
            throw new Error('Only clients can release payments');
        }
        const updatedJob = await this.jobsService.releaseMilestone(releaseMilestoneDto, clientId);
        return job_mapper_1.JobMapper.toDto(updatedJob);
    }
    async remove(id, req) {
        const userId = req.user['userId'];
        const role = req.user['role'];
        const job = await this.jobsService.findById(id);
        if (job.client.toString() !== userId && role !== user_schema_1.UserRole.CLIENT) {
            throw new Error('Unauthorized to delete this job');
        }
        return this.jobsService.remove(id);
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('skills')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('client'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "findByClient", null);
__decorate([
    (0, common_1.Get)('freelancer'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "findByFreelancer", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [job_dto_1.CreateJobDto, Object]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, job_dto_1.UpdateJobDto, Object]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('milestone'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [job_dto_1.CreateMilestoneDto, Object]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "addMilestone", null);
__decorate([
    (0, common_1.Put)(':jobId/milestone/:milestoneIndex'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, common_1.Param)('milestoneIndex')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, job_dto_1.UpdateMilestoneDto, Object]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "updateMilestone", null);
__decorate([
    (0, common_1.Post)('submit'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [job_dto_1.SubmitMilestoneDto, Object]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "submitMilestone", null);
__decorate([
    (0, common_1.Post)('assignReviewers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [job_dto_1.AssignReviewersDto, Object]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "assignReviewers", null);
__decorate([
    (0, common_1.Post)('vote'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [job_dto_1.VoteMilestoneDto, Object]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "voteMilestone", null);
__decorate([
    (0, common_1.Post)('release'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [job_dto_1.ReleaseMilestoneDto, Object]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "releaseMilestone", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "remove", null);
JobsController = __decorate([
    (0, common_1.Controller)('jobs'),
    __metadata("design:paramtypes", [jobs_service_1.JobsService])
], JobsController);
exports.JobsController = JobsController;
//# sourceMappingURL=jobs.controller.js.map