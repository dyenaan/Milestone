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
const contract_service_1 = require("./services/contract.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_schema_1 = require("../users/schemas/user.schema");
let BlockchainController = class BlockchainController {
    constructor(contractService) {
        this.contractService = contractService;
    }
    async getProject(id) {
        return this.contractService.getProject(Number(id));
    }
    async createProject(body) {
        const { worker, deadline } = body;
        const client = '0x123';
        return this.contractService.createProject(client, worker, deadline);
    }
    async fundProject(body) {
        const { projectId, amount } = body;
        const client = '0x123';
        return this.contractService.fundProject(client, projectId, amount);
    }
    async startWork(body) {
        const { projectId } = body;
        const worker = '0x456';
        return this.contractService.startWork(worker, projectId);
    }
    async approveCompletion(body) {
        const { projectId } = body;
        const address = '0x123';
        return this.contractService.approveCompletion(address, projectId);
    }
    async disputeProject(body) {
        const { projectId } = body;
        const address = '0x123';
        return this.contractService.disputeProject(address, projectId);
    }
    async resolveDispute(body) {
        const { projectId, recipient, clientAmount, workerAmount } = body;
        const admin = '0x789';
        return this.contractService.resolveDispute(admin, projectId, recipient, clientAmount, workerAmount);
    }
    async refundProject(body) {
        const { projectId } = body;
        const admin = '0x789';
        return this.contractService.refundProject(admin, projectId);
    }
    async getProjectMilestones(projectId) {
        return this.contractService.getProjectMilestones(Number(projectId));
    }
    async getMilestone(projectId, milestoneId) {
        return this.contractService.getMilestone(Number(projectId), Number(milestoneId));
    }
    async getMilestoneReviewers(projectId, milestoneId) {
        return this.contractService.getMilestoneReviewers(Number(projectId), Number(milestoneId));
    }
    async addMilestone(body) {
        const { projectId, description, amount, deadline } = body;
        const client = '0x123';
        return this.contractService.addMilestone(client, projectId, description, amount, deadline);
    }
    async submitMilestone(body) {
        const { projectId, milestoneId, evidence } = body;
        const worker = '0x456';
        return this.contractService.submitMilestone(worker, projectId, milestoneId, evidence);
    }
    async disputeMilestone(body) {
        const { projectId, milestoneId } = body;
        const address = '0x123';
        return this.contractService.disputeMilestone(address, projectId, milestoneId);
    }
    async resolveMilestoneDispute(body) {
        const { projectId, milestoneId, approveWork } = body;
        const admin = '0x789';
        return this.contractService.resolveMilestoneDispute(admin, projectId, milestoneId, approveWork);
    }
    async registerAsReviewer() {
        const address = '0x123';
        return this.contractService.registerAsReviewer(address);
    }
    async voteOnMilestone(body) {
        const { projectId, milestoneId, approved } = body;
        const reviewer = '0xabc';
        return this.contractService.voteOnMilestone(reviewer, projectId, milestoneId, approved);
    }
    async getReviewerReputation(address) {
        return this.contractService.getReviewerReputation(address);
    }
    async getTokenBalance(address) {
        return this.contractService.getTokenBalance(address);
    }
    async transferTokens(body) {
        const { to, amount } = body;
        const from = '0x123';
        return this.contractService.transferTokens(from, to, amount);
    }
};
__decorate([
    (0, common_1.Get)('project/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getProject", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.CLIENT),
    (0, common_1.Post)('project/create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "createProject", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.CLIENT),
    (0, common_1.Post)('project/fund'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "fundProject", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.FREELANCER),
    (0, common_1.Post)('project/start'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "startWork", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('project/approve'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "approveCompletion", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('project/dispute'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "disputeProject", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, common_1.Post)('project/resolve-dispute'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "resolveDispute", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, common_1.Post)('project/refund'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "refundProject", null);
__decorate([
    (0, common_1.Get)('project/:projectId/milestones'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getProjectMilestones", null);
__decorate([
    (0, common_1.Get)('project/:projectId/milestone/:milestoneId'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('milestoneId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getMilestone", null);
__decorate([
    (0, common_1.Get)('project/:projectId/milestone/:milestoneId/reviewers'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('milestoneId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getMilestoneReviewers", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.CLIENT),
    (0, common_1.Post)('project/milestone/add'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "addMilestone", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.FREELANCER),
    (0, common_1.Post)('project/milestone/submit'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "submitMilestone", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('project/milestone/dispute'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "disputeMilestone", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, common_1.Post)('project/milestone/resolve-dispute'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "resolveMilestoneDispute", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('reviewer/register'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "registerAsReviewer", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.REVIEWER),
    (0, common_1.Post)('reviewer/vote'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "voteOnMilestone", null);
__decorate([
    (0, common_1.Get)('reviewer/:address/reputation'),
    __param(0, (0, common_1.Param)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getReviewerReputation", null);
__decorate([
    (0, common_1.Get)('token/balance/:address'),
    __param(0, (0, common_1.Param)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getTokenBalance", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('token/transfer'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "transferTokens", null);
BlockchainController = __decorate([
    (0, common_1.Controller)('blockchain'),
    __metadata("design:paramtypes", [contract_service_1.ContractService])
], BlockchainController);
exports.BlockchainController = BlockchainController;
//# sourceMappingURL=blockchain.controller.js.map