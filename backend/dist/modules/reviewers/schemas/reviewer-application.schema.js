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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewerApplicationSchema = exports.ReviewerApplication = exports.ReviewerApplicationStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../../users/schemas/user.schema");
var ReviewerApplicationStatus;
(function (ReviewerApplicationStatus) {
    ReviewerApplicationStatus["PENDING"] = "pending";
    ReviewerApplicationStatus["APPROVED"] = "approved";
    ReviewerApplicationStatus["REJECTED"] = "rejected";
})(ReviewerApplicationStatus = exports.ReviewerApplicationStatus || (exports.ReviewerApplicationStatus = {}));
let ReviewerApplication = class ReviewerApplication extends mongoose_2.Document {
};
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", user_schema_1.User)
], ReviewerApplication.prototype, "user", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ReviewerApplication.prototype, "motivation", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], required: true }),
    __metadata("design:type", Array)
], ReviewerApplication.prototype, "expertiseAreas", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], ReviewerApplication.prototype, "yearsOfExperience", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ReviewerApplication.prototype, "portfolioUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ReviewerApplication.prototype, "linkedinUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ReviewerApplication.prototype, "githubUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ReviewerApplication.prototype, "resumeUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ReviewerApplicationStatus, default: ReviewerApplicationStatus.PENDING }),
    __metadata("design:type", String)
], ReviewerApplication.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ReviewerApplication.prototype, "rejectionReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", user_schema_1.User)
], ReviewerApplication.prototype, "reviewedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], ReviewerApplication.prototype, "reviewedAt", void 0);
ReviewerApplication = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ReviewerApplication);
exports.ReviewerApplication = ReviewerApplication;
exports.ReviewerApplicationSchema = mongoose_1.SchemaFactory.createForClass(ReviewerApplication);
//# sourceMappingURL=reviewer-application.schema.js.map