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
exports.ReviewersController = void 0;
const common_1 = require("@nestjs/common");
const reviewers_service_1 = require("./reviewers.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_schema_1 = require("../users/schemas/user.schema");
const reviewer_application_schema_1 = require("./schemas/reviewer-application.schema");
let ReviewersController = class ReviewersController {
    constructor(reviewersService) {
        this.reviewersService = reviewersService;
    }
    async applyAsReviewer(req, applicationData) {
        return this.reviewersService.submitApplication(req.user.id, applicationData);
    }
    async getMyApplication(req) {
        const applications = await this.reviewersService.getApplications();
        return applications.find(app => app.user._id.toString() === req.user.id);
    }
    async getAllApplications(status) {
        return this.reviewersService.getApplications(status);
    }
    async getApplicationById(id) {
        return this.reviewersService.getApplicationById(id);
    }
    async reviewApplication(req, id, reviewData) {
        return this.reviewersService.reviewApplication(id, req.user.id, reviewData.approve, reviewData.rejectionReason);
    }
    async getActiveReviewers() {
        return this.reviewersService.getActiveReviewers();
    }
    async getReviewersByExpertise(expertise) {
        return this.reviewersService.getReviewersByExpertise(expertise);
    }
    async getTopReviewers(limit = 10) {
        return this.reviewersService.getTopReviewers(limit);
    }
    async updateReviewerStats(id, updateData) {
        return this.reviewersService.updateReviewerStats(id, updateData);
    }
};
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('apply'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReviewersController.prototype, "applyAsReviewer", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('application/my'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReviewersController.prototype, "getMyApplication", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, common_1.Get)('applications'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReviewersController.prototype, "getAllApplications", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, common_1.Get)('application/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReviewersController.prototype, "getApplicationById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, common_1.Post)('application/:id/review'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ReviewersController.prototype, "reviewApplication", null);
__decorate([
    (0, common_1.Get)('active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReviewersController.prototype, "getActiveReviewers", null);
__decorate([
    (0, common_1.Get)('expertise/:area'),
    __param(0, (0, common_1.Param)('area')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReviewersController.prototype, "getReviewersByExpertise", null);
__decorate([
    (0, common_1.Get)('top'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReviewersController.prototype, "getTopReviewers", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    (0, common_1.Post)('stats/:id/update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReviewersController.prototype, "updateReviewerStats", null);
ReviewersController = __decorate([
    (0, common_1.Controller)('reviewers'),
    __metadata("design:paramtypes", [reviewers_service_1.ReviewersService])
], ReviewersController);
exports.ReviewersController = ReviewersController;
//# sourceMappingURL=reviewers.controller.js.map