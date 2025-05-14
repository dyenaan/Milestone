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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../users/schemas/user.schema");
const reviewer_application_schema_1 = require("./schemas/reviewer-application.schema");
const contract_service_1 = require("../blockchain/services/contract.service");
const users_service_1 = require("../users/users.service");
let ReviewersService = class ReviewersService {
    constructor(userModel, reviewerApplicationModel, contractService, usersService) {
        this.userModel = userModel;
        this.reviewerApplicationModel = reviewerApplicationModel;
        this.contractService = contractService;
        this.usersService = usersService;
    }
    async submitApplication(userId, applicationData) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const existingApplication = await this.reviewerApplicationModel.findOne({
            user: userId,
            status: { $in: [reviewer_application_schema_1.ReviewerApplicationStatus.PENDING, reviewer_application_schema_1.ReviewerApplicationStatus.APPROVED] },
        });
        if (existingApplication) {
            throw new common_1.BadRequestException('User already has a pending or approved application');
        }
        const newApplication = new this.reviewerApplicationModel(Object.assign(Object.assign({ user: userId }, applicationData), { status: reviewer_application_schema_1.ReviewerApplicationStatus.PENDING }));
        return newApplication.save();
    }
    async getApplications(status) {
        const query = status ? { status } : {};
        return this.reviewerApplicationModel.find(query).populate('user').exec();
    }
    async getApplicationById(id) {
        const application = await this.reviewerApplicationModel.findById(id).populate('user').exec();
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        return application;
    }
    async reviewApplication(applicationId, adminId, approve, rejectionReason) {
        const application = await this.reviewerApplicationModel.findById(applicationId);
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        if (application.status !== reviewer_application_schema_1.ReviewerApplicationStatus.PENDING) {
            throw new common_1.BadRequestException('Application is not pending');
        }
        const admin = await this.usersService.findById(adminId);
        if (!admin || admin.role !== user_schema_1.UserRole.ADMIN) {
            throw new common_1.BadRequestException('Only admins can review applications');
        }
        if (approve) {
            application.status = reviewer_application_schema_1.ReviewerApplicationStatus.APPROVED;
            await this.userModel.findByIdAndUpdate(application.user, {
                $set: {
                    role: user_schema_1.UserRole.REVIEWER,
                    isReviewer: true,
                    expertiseAreas: application.expertiseAreas
                }
            });
            const user = await this.usersService.findById(application.user);
            if (user && user.walletAddress) {
                try {
                    await this.contractService.registerAsReviewer(user.walletAddress);
                }
                catch (error) {
                    console.error('Failed to register reviewer on blockchain:', error);
                }
            }
        }
        else {
            application.status = reviewer_application_schema_1.ReviewerApplicationStatus.REJECTED;
            application.rejectionReason = rejectionReason;
        }
        application.reviewedBy = adminId;
        application.reviewedAt = new Date();
        return application.save();
    }
    async getActiveReviewers() {
        return this.userModel.find({
            role: user_schema_1.UserRole.REVIEWER,
            isReviewer: true,
        }).exec();
    }
    async getReviewersByExpertise(expertise) {
        return this.userModel.find({
            role: user_schema_1.UserRole.REVIEWER,
            isReviewer: true,
            expertiseAreas: expertise,
        }).exec();
    }
    async updateReviewerStats(reviewerId, data) {
        const reviewer = await this.usersService.findById(reviewerId);
        if (!reviewer || reviewer.role !== user_schema_1.UserRole.REVIEWER) {
            throw new common_1.NotFoundException('Reviewer not found');
        }
        const update = { $inc: { totalReviewsDone: 1 } };
        if (data.successful) {
            update.$inc.successfulReviewsCount = 1;
        }
        if (data.reputationChange) {
            update.$inc.reviewerReputation = data.reputationChange;
        }
        return this.userModel.findByIdAndUpdate(reviewerId, update, { new: true }).exec();
    }
    async getTopReviewers(limit = 10) {
        return this.userModel.find({
            role: user_schema_1.UserRole.REVIEWER,
            isReviewer: true,
        })
            .sort({ reviewerReputation: -1, totalReviewsDone: -1 })
            .limit(limit)
            .exec();
    }
};
ReviewersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(reviewer_application_schema_1.ReviewerApplication.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        contract_service_1.ContractService, typeof (_a = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _a : Object])
], ReviewersService);
exports.ReviewersService = ReviewersService;
//# sourceMappingURL=reviewers.service.js.map