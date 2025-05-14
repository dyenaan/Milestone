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
exports.BlockchainController = void 0;
const common_1 = require("@nestjs/common");
const aptos_service_1 = require("./aptos.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const create_project_dto_1 = require("./dto/create-project.dto");
const add_milestone_dto_1 = require("./dto/add-milestone.dto");
const fund_project_dto_1 = require("./dto/fund-project.dto");
const submit_milestone_dto_1 = require("./dto/submit-milestone.dto");
const review_milestone_dto_1 = require("./dto/review-milestone.dto");
let BlockchainController = class BlockchainController {
    constructor(aptosService) {
        this.aptosService = aptosService;
    }
    async createProject(createProjectDto) {
        const txHash = await this.aptosService.createProject(createProjectDto.clientAddress, createProjectDto.workerAddress, createProjectDto.deadline);
        return { txHash };
    }
    async addMilestone(projectId, addMilestoneDto) {
        const txHash = await this.aptosService.addMilestone(addMilestoneDto.clientAddress, projectId, addMilestoneDto.description, addMilestoneDto.amount, addMilestoneDto.deadline);
        return { txHash };
    }
    async fundProject(projectId, fundProjectDto) {
        const txHash = await this.aptosService.fundProject(fundProjectDto.clientAddress, projectId, fundProjectDto.amount);
        return { txHash };
    }
    async startWork(projectId, body) {
        const txHash = await this.aptosService.startWork(body.workerAddress, projectId);
        return { txHash };
    }
    async submitMilestone(projectId, milestoneId, submitMilestoneDto) {
        const txHash = await this.aptosService.submitMilestone(submitMilestoneDto.workerAddress, projectId, milestoneId, submitMilestoneDto.evidence);
        return { txHash };
    }
    async registerAsReviewer(body) {
        const txHash = await this.aptosService.registerAsReviewer(body.reviewerAddress);
        return { txHash };
    }
    async reviewMilestone(projectId, milestoneId, reviewMilestoneDto) {
        const txHash = await this.aptosService.reviewMilestone(reviewMilestoneDto.reviewerAddress, projectId, milestoneId, reviewMilestoneDto.approved);
        return { txHash };
    }
    async completeMilestone(projectId, milestoneId) {
        const txHash = await this.aptosService.completeMilestone(projectId, milestoneId);
        return { txHash };
    }
    async cancelProject(projectId, body) {
        const txHash = await this.aptosService.cancelProject(body.clientAddress, projectId);
        return { txHash };
    }
    async getProjectStatus(projectId) {
        const status = await this.aptosService.getProjectStatus(projectId);
        return { status };
    }
    async getMilestoneStatus(projectId, milestoneId) {
        const status = await this.aptosService.getMilestoneStatus(projectId, milestoneId);
        return { status };
    }
    async isReviewer(address) {
        const result = await this.aptosService.isReviewer(address);
        return { isReviewer: result };
    }
};
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('project'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_project_dto_1.CreateProjectDto]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "createProject", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('project/:projectId/milestone'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, add_milestone_dto_1.AddMilestoneDto]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "addMilestone", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('project/:projectId/fund'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, fund_project_dto_1.FundProjectDto]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "fundProject", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('project/:projectId/start'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "startWork", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('project/:projectId/milestone/:milestoneId/submit'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('milestoneId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, submit_milestone_dto_1.SubmitMilestoneDto]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "submitMilestone", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('reviewer/register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "registerAsReviewer", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('project/:projectId/milestone/:milestoneId/review'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('milestoneId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, review_milestone_dto_1.ReviewMilestoneDto]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "reviewMilestone", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('project/:projectId/milestone/:milestoneId/complete'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('milestoneId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "completeMilestone", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('project/:projectId/cancel'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "cancelProject", null);
__decorate([
    (0, common_1.Get)('project/:projectId/status'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getProjectStatus", null);
__decorate([
    (0, common_1.Get)('project/:projectId/milestone/:milestoneId/status'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('milestoneId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getMilestoneStatus", null);
__decorate([
    (0, common_1.Get)('reviewer/:address'),
    __param(0, (0, common_1.Param)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "isReviewer", null);
BlockchainController = __decorate([
    (0, common_1.Controller)('blockchain'),
    __metadata("design:paramtypes", [aptos_service_1.AptosService])
], BlockchainController);
exports.BlockchainController = BlockchainController;
//# sourceMappingURL=blockchain.controller.js.map