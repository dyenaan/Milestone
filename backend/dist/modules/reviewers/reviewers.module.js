"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewersModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const blockchain_module_1 = require("../blockchain/blockchain.module");
const reviewers_controller_1 = require("./reviewers.controller");
const reviewers_service_1 = require("./reviewers.service");
const users_module_1 = require("../users/users.module");
const user_schema_1 = require("../users/schemas/user.schema");
const reviewer_application_schema_1 = require("./schemas/reviewer-application.schema");
let ReviewersModule = class ReviewersModule {
};
ReviewersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: reviewer_application_schema_1.ReviewerApplication.name, schema: reviewer_application_schema_1.ReviewerApplicationSchema },
            ]),
            blockchain_module_1.BlockchainModule,
            users_module_1.UsersModule,
        ],
        controllers: [reviewers_controller_1.ReviewersController],
        providers: [reviewers_service_1.ReviewersService],
        exports: [reviewers_service_1.ReviewersService],
    })
], ReviewersModule);
exports.ReviewersModule = ReviewersModule;
//# sourceMappingURL=reviewers.module.js.map