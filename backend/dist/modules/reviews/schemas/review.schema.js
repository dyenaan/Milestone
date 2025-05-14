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
exports.ReviewSchema = exports.Review = exports.ReviewType = exports.ReviewStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var ReviewStatus;
(function (ReviewStatus) {
    ReviewStatus["PENDING"] = "pending";
    ReviewStatus["APPROVED"] = "approved";
    ReviewStatus["REJECTED"] = "rejected";
})(ReviewStatus = exports.ReviewStatus || (exports.ReviewStatus = {}));
var ReviewType;
(function (ReviewType) {
    ReviewType["MILESTONE"] = "milestone";
    ReviewType["FREELANCER"] = "freelancer";
    ReviewType["CLIENT"] = "client";
})(ReviewType = exports.ReviewType || (exports.ReviewType = {}));
let Review = class Review extends mongoose_2.Document {
};
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Job', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], Review.prototype, "job", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], Review.prototype, "reviewer", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], Review.prototype, "reviewee", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Review.prototype, "milestoneIndex", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Review.prototype, "rating", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Review.prototype, "comment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Review.prototype, "approved", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['Job', 'User', 'Milestone'] }),
    __metadata("design:type", String)
], Review.prototype, "onModel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ReviewType, required: true }),
    __metadata("design:type", String)
], Review.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ReviewStatus, default: ReviewStatus.PENDING }),
    __metadata("design:type", String)
], Review.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Review.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)({ min: 1, max: 5, default: null }),
    __metadata("design:type", Number)
], Review.prototype, "rating", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Review.prototype, "rewardAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Review.prototype, "rewardPaid", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Review.prototype, "transactionHash", void 0);
Review = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Review);
exports.Review = Review;
exports.ReviewSchema = mongoose_1.SchemaFactory.createForClass(Review);
//# sourceMappingURL=review.schema.js.map