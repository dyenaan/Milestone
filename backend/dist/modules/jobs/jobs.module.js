"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const jobs_controller_1 = require("./controllers/jobs.controller");
const jobs_service_1 = require("./services/jobs.service");
const job_schema_1 = require("./schemas/job.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const auth_module_1 = require("../auth/auth.module");
const notifications_module_1 = require("../notifications/notifications.module");
const blockchain_module_1 = require("../blockchain/blockchain.module");
let JobsModule = class JobsModule {
};
JobsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: job_schema_1.Job.name, schema: job_schema_1.JobSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
            ]),
            auth_module_1.AuthModule,
            notifications_module_1.NotificationsModule,
            blockchain_module_1.BlockchainModule,
        ],
        controllers: [jobs_controller_1.JobsController],
        providers: [jobs_service_1.JobsService],
        exports: [jobs_service_1.JobsService],
    })
], JobsModule);
exports.JobsModule = JobsModule;
//# sourceMappingURL=jobs.module.js.map